import random

def greet(*names, language='en'):
    """
    Greet one or more people by name in different languages.
    
    Args:
    *names: One or more names to greet.
    language: Language code for the greeting (default: 'en' for English).
    
    Returns:
    A greeting string in the specified language.
    """
    greetings = {
        'en': 'Hello',
        'es': 'Hola',
        'fr': 'Bonjour',
        'de': 'Hallo',
        'it': 'Ciao'
    }
    
    greeting = greetings.get(language.lower(), greetings['en'])
    
    if not names:
        return f"{greeting}!"
    elif len(names) == 1:
        return f"{greeting}, {names[0]}!"
    else:
        return f"{greeting}, {', '.join(names[:-1])} and {names[-1]}!"

def calculate_area(length: float, width: float) -> float:
    """
    Calculate the area of a rectangle.
    
    Args:
    length (float): The length of the rectangle.
    width (float): The width of the rectangle.
    
    Returns:
    float: The area of the rectangle.
    
    Raises:
    ValueError: If length or width is negative.
    """
    if length < 0 or width < 0:
        raise ValueError("Length and width must be non-negative.")
    return length * width

def generate_password(length: int = 8) -> str:
    """
    Generate a random password of given length.
    
    Args:
    length (int): The length of the password (default: 8).
    
    Returns:
    str: A random password containing at least one uppercase letter,
         one lowercase letter, one digit, and one special character.
    """
    lowercase = "abcdefghijklmnopqrstuvwxyz"
    uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    digits = "0123456789"
    special = "!@#$%^&*"
    all_characters = lowercase + uppercase + digits + special

    password = [
        random.choice(lowercase),
        random.choice(uppercase),
        random.choice(digits),
        random.choice(special)
    ]

    for _ in range(length - 4):
        password.append(random.choice(all_characters))

    random.shuffle(password)
    return ''.join(password)

def fibonacci(n: int) -> int:
    """
    Return the nth Fibonacci number using dynamic programming.

    Args:
    n (int): The position of the Fibonacci number to calculate.

    Returns:
    int: The nth Fibonacci number.

    Raises:
    ValueError: If n is negative.
    """
    if n < 0:
        raise ValueError("n must be a non-negative integer.")
    if n <= 1:
        return n

    fib = [0] * (n + 1)
    fib[1] = 1

    for i in range(2, n + 1):
        fib[i] = fib[i-1] + fib[i-2]

    return fib[n]
    

def main():
    print(greet("Alice"))
    print(f"Area of rectangle: {calculate_area(5, 3)}")
    print(f"Generated password: {generate_password(12)}")
    print(f"10th Fibonacci number: {fibonacci(10)}")

if __name__ == "__main__":
    main()
