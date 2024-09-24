import math
from typing import List, Dict, Union

# TODO: Rewrite this function using list comprehension
def filter_even_numbers(numbers):
    result = []
    for num in numbers:
        if num % 2 == 0:
            result.append(num)
    return result

# TODO: Rewrite this function using a lambda function
def multiply_by_two(x):
    return x * 2

# TODO: Rewrite this class using dataclasses
class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age

    def __str__(self):
        return f"{self.name} ({self.age})"

# TODO: Rewrite this function using f-strings
def greet(name, age):
    return "Hello, " + name + "! You are " + str(age) + " years old."

# TODO: Rewrite this function using a dictionary comprehension
def create_square_dict(numbers):
    result = {}
    for num in numbers:
        result[num] = num ** 2
    return result

# TODO: Rewrite this function using the walrus operator (:=)
def find_first_even(numbers):
    for num in numbers:
        if num % 2 == 0:
            return num
    return None

# TODO: Rewrite this class to use a class method for alternative constructor
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    def area(self):
        return self.width * self.height

# TODO: Rewrite this function to use type hints
def calculate_average(numbers):
    if not numbers:
        return 0
    return sum(numbers) / len(numbers)

# TODO: Rewrite this function to use a decorator for input validation
def calculate_circle_area(radius):
    if radius < 0:
        raise ValueError("Radius cannot be negative")
    return math.pi * radius ** 2

# TODO: Rewrite this class to use properties for getter and setter
class BankAccount:
    def __init__(self, balance):
        self._balance = balance

    def get_balance(self):
        return self._balance

    def set_balance(self, value):
        if value < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = value

# TODO: Rewrite this function to use *args and **kwargs
def concatenate_strings(separator, *args):
    return separator.join(args)

# TODO: Rewrite this class to use inheritance
class Car:
    def __init__(self, make, model, year):
        self.make = make
        self.model = model
        self.year = year

    def display_info(self):
        return f"{self.year} {self.make} {self.model}"

# TODO: Rewrite this function to use a context manager
def read_file_contents(filename):
    file = open(filename, 'r')
    contents = file.read()
    file.close()
    return contents

# TODO: Rewrite this function to use async/await
def fetch_data(url):
    # Simulating network request
    import time
    time.sleep(1)
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
    print(account.get_balance())
    account.set_balance(1500)
    print(concatenate_strings(", ", "apple", "banana", "cherry"))
    car = Car("Toyota", "Camry", 2022)
    print(car.display_info())
    print(read_file_contents("example.txt"))
    print(fetch_data("https://api.example.com/data"))