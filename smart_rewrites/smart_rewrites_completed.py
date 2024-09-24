import math
import asyncio
from typing import List, Dict, Optional

# TODO: Rewrite this function using list comprehension

def filter_even_numbers(numbers):
    """
    Filters even numbers from a list of numbers.
    """
    return [num for num in numbers if num % 2 == 0]         

# TODO: Rewrite this function using a lambda function
multiply_by_two = lambda x: x * 2

# TODO: Rewrite this class using dataclasses
from dataclasses import dataclass

@dataclass
class Person:
    """
    A class representing a person with a name and age.
    """
    name: str
    age: int

    def __str__(self):
        return f"{self.name} ({self.age})"

# TODO: Rewrite this function using f-strings
def greet(name: str, age: int) -> str:
    """
    Greets a person by name and age.
    """
    return f"Hello, {name}! You are {age} years old."

# TODO: Rewrite this function using a dictionary comprehension
def create_square_dict(numbers: List[int]) -> Dict[int, int]:
    """
    Creates a dictionary with the square of each number in the list.
    """
    return {num: num ** 2 for num in numbers}

# TODO: Rewrite this function using the walrus operator (:=)
def find_first_even(numbers: List[int]) -> Optional[int]:
    """
    Finds the first even number in the list.
    """
    for num in numbers:
        if (num := num % 2) == 0:
            return num
    return None

# TODO: Rewrite this class to use a class method for alternative constructor
@dataclass
class Rectangle:
    width: int
    height: int

    @classmethod        
    def from_area(cls, area):
        width, height = cls.calculate_dimensions(area)
        return cls(width, height)

    @staticmethod
    def calculate_dimensions(area):
        width = math.sqrt(area)
        height = width
        return width, height

    def area(self):
        return self.width * self.height

# TODO: Rewrite this function to use type hints
def calculate_average(numbers: List[int]) -> float:
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

# TODO: Rewrite this function to use a decorator for input validation
def validate_radius(func):
    def wrapper(radius):
        if radius < 0:
            raise ValueError("Radius cannot be negative")
        return func(radius)
    return wrapper

@validate_radius
def calculate_circle_area(radius: float) -> float:
    """
    Calculates the area of a circle.
    """
    if radius < 0:
        raise ValueError("Radius cannot be negative")
    return math.pi * radius ** 2

# TODO: Rewrite this class to use properties for getter and setter
@dataclass
class BankAccount:
    _balance: float

    def __init__(self, initial_balance: float):
        self._balance = initial_balance

    @property
    def balance(self) -> float:
        return self._balance
    
    @balance.setter
    def balance(self, value):
        if value < 0:
            raise ValueError("Balance cannot be negative")
        self.balance = value

# TODO: Rewrite this function to use *args and **kwargs
def concatenate_strings(
    separator: str,
    *args: str,
    **kwargs: Dict[str, str]
) -> str:
    """
    Concatenates strings with a separator.
    """
    return separator.join(args)

# TODO: Rewrite this class to use inheritance
class Vehicle:
    def __init__(self, make, model, year):
        self.make = make
        self.model = model
        self.year = year

class Car(Vehicle):
    def __init__(self, make, model, year):
        super().__init__(make, model, year)
        self.make = make
        self.model = model
        self.year = year

    def display_info(self):
        return f"{self.year} {self.make} {self.model}"

# TODO: Rewrite this function to use a context manager
def read_file_contents(filename):
    with open(filename, 'r') as file:
        contents = file.read()
    file.close()
    return contents

# TODO: Rewrite this function to use async/await
async def fetch_data(url):
    # Simulating network request
    import time
    await asyncio.sleep(1)
    return f"Data from {url}"

# Example usage of the above functions and classes
if __name__ == "__main__":
    print(filter_even_numbers([1, 2, 3, 4, 5, 6]))
    print(multiply_by_two(5))
    print(Person("Alice", 30))
    print(greet("Bob", 25))
    print(create_square_dict([1, 2, 3, 4]))
    print(find_first_even([1, 3, 5, 6, 7, 8]))
    rect = Rectangle(5, 3)
    print(rect.area())
    print(calculate_average([1, 2, 3, 4, 5]))
    print(calculate_circle_area(5))
    account = BankAccount(1000)
    print(account.balance)
    account._balance = 1500
    print(concatenate_strings(", ", "apple", "banana", "cherry"))
    car = Car("Toyota", "Camry", 2022)
    print(car.display_info())
    print(read_file_contents("example.txt"))
    print(fetch_data("https://api.example.com/data"))