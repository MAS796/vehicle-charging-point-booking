from datetime import datetime

def is_station_open(opening_time, closing_time):
    """
    Returns True if current time is between opening and closing time.
    """
    if not opening_time or not closing_time:
        return False
    now = datetime.now().time()
    return opening_time <= now <= closing_time
