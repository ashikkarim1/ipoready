-- Premium Subscription System
-- Enables add-on services with clear paid tier activation

CREATE TABLE subscription_tiers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE, -- 'starter', 'professional', 'enterprise'
  display_name VARCHAR(100) NOT NULL, -- 'Professional', 'Enterprise'
  price_monthly_usd INT NOT NULL, -- in cents: 5000 = $50/month
  price_annual_usd INT NOT NULL,
  billing_interval VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'annual'
  description TEXT,
  features JSONB NOT NULL DEFAULT '{}', -- array of feature IDs enabled at this tier
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE company_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  tier_id BIGINT NOT NULL REFERENCES subscription_tiers(id),
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'cancelled', 'paused', 'past_due'
  stripe_subscription_id VARCHAR(255) UNIQUE,
  current_period_start DATE NOT NULL,
  current_period_end DATE NOT NULL,
  cancelled_at TIMESTAMP,
  trial_ends_at TIMESTAMP, -- NULL if no trial
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE premium_features (
  id BIGSERIAL PRIMARY KEY,
  feature_key VARCHAR(100) NOT NULL UNIQUE, -- 'ceo_dashboard', 'advisor_network', etc.
  display_name VARCHAR(150) NOT NULL, -- "CEO Command Center"
  description TEXT NOT NULL,
  category VARCHAR(50), -- 'dashboards', 'coordination', 'execution', 'post-ipo'
  min_tier_id BIGINT NOT NULL REFERENCES subscription_tiers(id),
  icon VARCHAR(50), -- lucide icon name: 'crown', 'users', 'trello', etc.
  badge_text VARCHAR(30), -- "New", "Premium", "Enterprise"
  badge_color VARCHAR(20), -- 'gold', 'blue', 'red'
  value_prop TEXT, -- one-liner: "Real-time executive visibility & risk alerts"
  monthly_value_usd INT, -- in cents: what this feature would cost standalone
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE feature_activations (
  id BIGSERIAL PRIMARY KEY,
  company_id BIGINT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  feature_id BIGINT NOT NULL REFERENCES premium_features(id) ON DELETE CASCADE,
  activated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activated_by_user_id BIGINT REFERENCES users(id),
  deactivated_at TIMESTAMP,
  activated_via VARCHAR(50), -- 'upgrade_flow', 'trial', 'enterprise_grant'
  usage_count INT DEFAULT 0,
  last_accessed_at TIMESTAMP,
  UNIQUE(company_id, feature_id)
);

-- Indexes for fast lookups
CREATE INDEX idx_company_subscriptions_company_id ON company_subscriptions(company_id);
CREATE INDEX idx_company_subscriptions_status ON company_subscriptions(status);
CREATE INDEX idx_feature_activations_company_id ON feature_activations(company_id);
CREATE INDEX idx_premium_features_tier ON premium_features(min_tier_id);

-- Seed subscription tiers
INSERT INTO subscription_tiers (name, display_name, price_monthly_usd, price_annual_usd, description, features) VALUES
('starter', 'Starter', 0, 0, 'Free tier - Core IPO planning tools', '[]'::jsonb),
('professional', 'Professional', 9900, 99000, 'Add executive dashboards & insights', '["ceo_dashboard", "board_portal", "timeline_prediction"]'::jsonb),
('enterprise', 'Enterprise', 25000, 250000, 'Complete IPO orchestration platform', '["ceo_dashboard", "board_portal", "timeline_prediction", "advisor_network", "cfo_dashboard", "gc_dashboard", "post_ipo_compliance", "multi_country_filing"]'::jsonb);

-- Seed premium features
INSERT INTO premium_features (feature_key, display_name, description, category, min_tier_id, icon, badge_text, badge_color, value_prop, monthly_value_usd) VALUES
(
  'ceo_dashboard',
  'CEO Command Center',
  'Real-time executive dashboard with IPO status, key metrics, risk alerts, and board-ready reports',
  'dashboards',
  (SELECT id FROM subscription_tiers WHERE name = 'professional'),
  'crown',
  'Premium',
  'gold',
  'Real-time executive visibility & risk alerts',
  5000
),
(
  'board_portal',
  'Board Intelligence Portal',
  'Board-ready materials, governance tracking, meeting minutes, and action item management',
  'dashboards',
  (SELECT id FROM subscription_tiers WHERE name = 'professional'),
  'users',
  'Premium',
  'gold',
  'Board materials & governance in one place',
  4000
),
(
  'timeline_prediction',
  'IPO Timeline Prediction',
  'AI-powered prediction of actual IPO date (±2 weeks) based on historical patterns and current progress',
  'dashboards',
  (SELECT id FROM subscription_tiers WHERE name = 'professional'),
  'zap',
  'New',
  'blue',
  'Predict actual IPO timing vs. plan',
  3000
),
(
  'advisor_network',
  'Advisor Orchestration Network',
  'Coordinate 15+ advisors with dependency tracking, automated escalation, and real-time collaboration',
  'coordination',
  (SELECT id FROM subscription_tiers WHERE name = 'enterprise'),
  'trello',
  'Enterprise',
  'red',
  '40% faster timeline with advisor coordination',
  10000
),
(
  'cfo_dashboard',
  'CFO Financial Dashboard',
  'Financial modeling, unit economics, runway analysis, and waterfall forecasting',
  'dashboards',
  (SELECT id FROM subscription_tiers WHERE name = 'enterprise'),
  'bar-chart-3',
  'Premium',
  'gold',
  'Real-time financial tracking & modeling',
  5000
),
(
  'gc_dashboard',
  'GC Legal Dashboard',
  'Legal compliance tracking, document automation, audit trail, and regulatory requirements',
  'dashboards',
  (SELECT id FROM subscription_tiers WHERE name = 'enterprise'),
  'shield',
  'Premium',
  'gold',
  'Legal compliance & document tracking',
  4000
),
(
  'post_ipo_compliance',
  'Post-IPO Compliance Module',
  'Automated compliance for 12+ months post-listing including quiet period, reporting, and SEC filings',
  'post-ipo',
  (SELECT id FROM subscription_tiers WHERE name = 'enterprise'),
  'check-circle',
  'Enterprise',
  'red',
  'Stay compliant after listing',
  8000
),
(
  'multi_country_filing',
  'Multi-Country Filing System',
  'File in SEDAR 2, SEC Edgar, TSX, NASDAQ, CSE, and 50+ other exchanges from one platform',
  'execution',
  (SELECT id FROM subscription_tiers WHERE name = 'enterprise'),
  'globe',
  'Enterprise',
  'red',
  'Global filing simplified',
  15000
);

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_subscription_tiers_updated_at BEFORE UPDATE ON subscription_tiers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_subscriptions_updated_at BEFORE UPDATE ON company_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_premium_features_updated_at BEFORE UPDATE ON premium_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
