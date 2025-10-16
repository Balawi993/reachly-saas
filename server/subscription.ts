import { query } from './db-postgres';
import logger from './logger';

/**
 * Get user's subscription with plan details
 */
export async function getUserSubscription(userId: number) {
  const result = await query(`
    SELECT 
      us.*,
      sp.name as plan_name,
      sp.price as plan_price,
      sp.max_accounts,
      sp.max_dms_per_month,
      sp.max_follows_per_month,
      sp.max_active_dm_campaigns,
      sp.max_active_follow_campaigns
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = $1
  `, [userId]);

  if (result.rows.length === 0) {
    throw new Error('No subscription found for user');
  }

  return result.rows[0];
}

/**
 * Check if user can perform an action based on their subscription limits
 */
export async function checkSubscriptionLimit(userId: number, action: string): Promise<void> {
  const subscription = await getUserSubscription(userId);

  // Check if subscription period has ended
  if (subscription.period_end && new Date(subscription.period_end) < new Date()) {
    // Period ended - reset to Free plan
    await resetToFreePlan(userId);
    throw new Error('Your subscription period has ended. You have been moved to the Free plan.');
  }

  switch (action) {
    case 'send_dm':
      if (subscription.dms_used_this_period >= subscription.max_dms_per_month) {
        throw new Error(`Monthly DM limit reached (${subscription.max_dms_per_month}). Please upgrade your plan.`);
      }
      break;

    case 'follow_user':
      if (subscription.follows_used_this_period >= subscription.max_follows_per_month) {
        throw new Error(`Monthly follow limit reached (${subscription.max_follows_per_month}). Please upgrade your plan.`);
      }
      break;

    case 'create_dm_campaign':
      const activeDMCampaigns = await query(`
        SELECT COUNT(*) FROM campaigns 
        WHERE user_id = $1 AND status IN ('active', 'paused')
      `, [userId]);
      const dmCount = parseInt(activeDMCampaigns.rows[0].count);
      if (dmCount >= subscription.max_active_dm_campaigns) {
        throw new Error(`Active DM campaign limit reached (${subscription.max_active_dm_campaigns}). Please upgrade your plan.`);
      }
      break;

    case 'create_follow_campaign':
      const activeFollowCampaigns = await query(`
        SELECT COUNT(*) FROM follow_campaigns 
        WHERE user_id = $1 AND status IN ('active', 'paused')
      `, [userId]);
      const followCount = parseInt(activeFollowCampaigns.rows[0].count);
      if (followCount >= subscription.max_active_follow_campaigns) {
        throw new Error(`Active follow campaign limit reached (${subscription.max_active_follow_campaigns}). Please upgrade your plan.`);
      }
      break;

    case 'add_account':
      const accountsCount = await query(`
        SELECT COUNT(*) FROM accounts WHERE user_id = $1
      `, [userId]);
      const count = parseInt(accountsCount.rows[0].count);
      if (count >= subscription.max_accounts) {
        throw new Error(`Account limit reached (${subscription.max_accounts}). Please upgrade your plan.`);
      }
      break;

    default:
      logger.warn('Unknown subscription action', { action });
  }
}

/**
 * Increment usage counter
 */
export async function incrementUsage(userId: number, type: 'dms' | 'follows'): Promise<void> {
  const column = type === 'dms' ? 'dms_used_this_period' : 'follows_used_this_period';
  
  await query(`
    UPDATE user_subscriptions 
    SET ${column} = ${column} + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
  `, [userId]);
}

/**
 * Reset user to Free plan when subscription ends
 */
async function resetToFreePlan(userId: number): Promise<void> {
  logger.info('Resetting user to Free plan', { userId });
  
  const freePlan = await query(`SELECT id FROM subscription_plans WHERE name = 'Free'`);
  const freePlanId = freePlan.rows[0].id;

  await query(`
    UPDATE user_subscriptions 
    SET plan_id = $1,
        status = 'active',
        dms_used_this_period = 0,
        follows_used_this_period = 0,
        period_start = CURRENT_TIMESTAMP,
        period_end = CURRENT_TIMESTAMP + INTERVAL '30 days',
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $2
  `, [freePlanId, userId]);
}

/**
 * Change user's subscription plan
 */
export async function changeUserPlan(userId: number, planId: number): Promise<void> {
  await query(`
    UPDATE user_subscriptions 
    SET plan_id = $1,
        dms_used_this_period = 0,
        follows_used_this_period = 0,
        period_start = CURRENT_TIMESTAMP,
        period_end = CURRENT_TIMESTAMP + INTERVAL '30 days',
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $2
  `, [planId, userId]);

  logger.info('User plan changed', { userId, planId });
}

/**
 * Reset user's usage counters
 */
export async function resetUserUsage(userId: number): Promise<void> {
  await query(`
    UPDATE user_subscriptions 
    SET dms_used_this_period = 0,
        follows_used_this_period = 0,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = $1
  `, [userId]);

  logger.info('User usage reset', { userId });
}

/**
 * Get all subscription plans
 */
export async function getAllPlans() {
  const result = await query(`
    SELECT * FROM subscription_plans 
    WHERE is_active = true 
    ORDER BY display_order ASC
  `);
  return result.rows;
}

/**
 * Get plan by ID
 */
export async function getPlanById(planId: number) {
  const result = await query(`
    SELECT * FROM subscription_plans WHERE id = $1
  `, [planId]);
  
  if (result.rows.length === 0) {
    throw new Error('Plan not found');
  }
  
  return result.rows[0];
}

/**
 * Update subscription plan
 */
export async function updatePlan(planId: number, updates: any) {
  const fields: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(updates)) {
    fields.push(`${key} = $${paramIndex}`);
    values.push(value);
    paramIndex++;
  }

  fields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(planId);

  await query(`
    UPDATE subscription_plans 
    SET ${fields.join(', ')}
    WHERE id = $${paramIndex}
  `, values);

  logger.info('Plan updated', { planId, updates });
}

/**
 * Get all users with their subscriptions
 */
export async function getAllUsersWithSubscriptions() {
  const result = await query(`
    SELECT 
      u.id,
      u.email,
      u.first_name,
      u.last_name,
      u.role,
      u.created_at,
      sp.name as plan_name,
      sp.price as plan_price,
      us.status,
      us.dms_used_this_period,
      us.follows_used_this_period,
      us.period_end,
      sp.max_dms_per_month,
      sp.max_follows_per_month
    FROM users u
    LEFT JOIN user_subscriptions us ON u.id = us.user_id
    LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
    ORDER BY u.created_at DESC
  `);
  
  return result.rows;
}

/**
 * Get system statistics
 */
export async function getSystemStats() {
  const totalUsers = await query(`SELECT COUNT(*) FROM users WHERE role = 'user'`);
  const totalDMs = await query(`SELECT SUM(stats_sent) FROM campaigns`);
  const totalFollows = await query(`SELECT SUM(stats_followed) FROM follow_campaigns`);
  const activeCampaigns = await query(`SELECT COUNT(*) FROM campaigns WHERE status = 'active'`);
  const activeFollowCampaigns = await query(`SELECT COUNT(*) FROM follow_campaigns WHERE status = 'active'`);
  
  const planDistribution = await query(`
    SELECT 
      sp.name,
      COUNT(us.id) as user_count
    FROM subscription_plans sp
    LEFT JOIN user_subscriptions us ON sp.id = us.plan_id
    GROUP BY sp.id, sp.name
    ORDER BY sp.display_order
  `);

  const mrr = await query(`
    SELECT SUM(sp.price) as total
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.status = 'active'
  `);

  return {
    totalUsers: parseInt(totalUsers.rows[0].count),
    totalDMs: parseInt(totalDMs.rows[0].sum || 0),
    totalFollows: parseInt(totalFollows.rows[0].sum || 0),
    activeCampaigns: parseInt(activeCampaigns.rows[0].count),
    activeFollowCampaigns: parseInt(activeFollowCampaigns.rows[0].count),
    planDistribution: planDistribution.rows,
    mrr: parseFloat(mrr.rows[0].total || 0),
    arr: parseFloat(mrr.rows[0].total || 0) * 12
  };
}
