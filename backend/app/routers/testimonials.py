from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_testimonials():
    """Get user testimonials"""
    return {
        "testimonials": [
            {
                "name": "Rahul Kumar",
                "message": "Seamless EV charging experience with instant booking!",
                "rating": 5,
                "avatar": "👨‍💼"
            },
            {
                "name": "Ananya Singh",
                "message": "Best smart charging platform for Delhi. Highly recommended!",
                "rating": 5,
                "avatar": "👩‍💼"
            },
            {
                "name": "Vikram Patel",
                "message": "AI prediction saved me hours of waiting. Outstanding service!",
                "rating": 5,
                "avatar": "👨‍🔧"
            }
        ]
    }

@router.get("/featured")
def featured_testimonials():
    """Get featured testimonials"""
    return {
        "featured": [
            {
                "name": "Priya Sharma",
                "company": "Tesla Club India",
                "message": "Integrated seamlessly with our fleet management. Game changer!",
                "rating": 5
            }
        ]
    }
