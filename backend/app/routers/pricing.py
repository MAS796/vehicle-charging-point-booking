from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def pricing_plans():
    """Get SaaS pricing plans"""
    return {
        "plans": [
            {
                "id": "starter",
                "name": "Starter",
                "price": 0,
                "currency": "USD",
                "billing_period": "monthly",
                "description": "Perfect for individual EV users",
                "features": [
                    "Basic station booking",
                    "Standard support",
                    "Mobile app access",
                    "Payment tracking"
                ],
                "popular": False
            },
            {
                "id": "pro",
                "name": "Pro",
                "price": 19,
                "currency": "USD",
                "billing_period": "monthly",
                "description": "For power users and businesses",
                "features": [
                    "AI charging optimization",
                    "Advanced analytics dashboard",
                    "Priority 24/7 support",
                    "API access",
                    "Priority booking",
                    "Subscription management"
                ],
                "popular": True,
                "savings": "Save 20% annually"
            },
            {
                "id": "enterprise",
                "name": "Enterprise",
                "price": "Custom",
                "currency": "USD",
                "billing_period": "annually",
                "description": "For large fleet operators",
                "features": [
                    "Unlimited API calls",
                    "Custom integrations",
                    "Dedicated account manager",
                    "White-label solutions",
                    "Advanced security",
                    "SLA guarantee"
                ],
                "popular": False,
                "contact_sales": True
            }
        ],
        "faq": [
            {
                "question": "Can I upgrade my plan anytime?",
                "answer": "Yes! You can upgrade or downgrade your plan at any time."
            },
            {
                "question": "Is there a free trial?",
                "answer": "Absolutely! Get 30 days free with the Pro plan."
            },
            {
                "question": "Do you offer refunds?",
                "answer": "Yes, 30-day money-back guarantee on Pro plan."
            }
        ]
    }

@router.get("/comparison")
def plan_comparison():
    """Get detailed plan comparison"""
    return {
        "comparison": {
            "stations": {"starter": "Up to 10", "pro": "Unlimited", "enterprise": "Unlimited"},
            "api_calls": {"starter": "100/day", "pro": "10k/day", "enterprise": "Unlimited"},
            "support": {"starter": "Email", "pro": "24/7 Chat", "enterprise": "Dedicated"},
            "analytics": {"starter": "Basic", "pro": "Advanced", "enterprise": "Custom"}
        }
    }
