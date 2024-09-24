from datetime import datetime

def calculate_todays_date_versus_birthday(birthday: datetime) -> bool:
    today = datetime.now()
    return today.day == birthday.day and today.month == birthday.month

# Create some helper functions:
def is_in_certain_age_range(age: int) -> bool:
    return age >= 18 and age <= 65

def is_in_certain_month(month: int) -> bool:
    return month >= 1 and month <= 12

def is_in_certain_day_of_week(day: int) -> bool:
    return day >= 1 and day <= 7

def is_in_certain_hour(hour: int) -> bool:
    return hour >= 0 and hour <= 23
    