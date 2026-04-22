def calculate_split(amount: float, platform_fee_percent: float = 0.15) -> dict[str, float]:
    if amount < 0:
        raise ValueError("amount must be non-negative")

    fee_percent = max(0.0, min(float(platform_fee_percent), 1.0))
    platform_fee = round(float(amount) * fee_percent, 2)
    owner_share = round(float(amount) - platform_fee, 2)

    return {
        "platform": platform_fee,
        "owner": owner_share,
        "platform_fee_percent": round(fee_percent * 100, 2),
    }
