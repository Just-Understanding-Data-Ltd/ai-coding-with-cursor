import random

def greet(name):
    """Greet a person by name."""
    return f"Hello, {name}!"

def calculate_area(length, width):
    """Calculate the area of a rectangle."""
    return length * width

def generate_password(length=8):
    """Generate a random password of given length."""
    characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    return ''.join(random.choice(characters) for _ in range(length))

def fibonacci(n):
    """Return the nth Fibonacci number."""
    if n <= 1:
        return n
    else:
        a, b = 0, 1
        for _ in range(2, n + 1):
            a, b = b, a + b
        return b

# TODO: Upgrade greet() to handle multiple names and different languages
# TODO: Add input validation to calculate_area() and handle negative inputs
# TODO: Improve generate_password() to ensure it includes at least one of each: uppercase, lowercase, digit, and special character
# TODO: Optimize fibonacci() function for large numbers using memoization or dynamic programming

def main():
    print(greet("Alice"))
    print(f"Area of rectangle: {calculate_area(5, 3)}")
    print(f"Generated password: {generate_password(12)}")
    print(f"10th Fibonacci number: {fibonacci(10)}")

if __name__ == "__main__":
    main()

# Additional practice areas:
# 1. Implement error handling using try-except blocks
# 2. Add type hints to function parameters and return values
# 3. Create a class that encapsulates related functions (e.g., GeometryCalculator)
# 4. Write unit tests for each function
# 5. Use list comprehensions or generator expressions where appropriate
# 6. Implement logging to track function calls and results