import pandas as pd # type: ignore
import numpy as np

# Sample employee data, add 3 extra columns with random data: Experience, Bonus, and Department

data = {
    'Name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
    'Age': [25, 30, 35, 28, 22],
    'City': ['New York', 'San Francisco', 'London', 'Paris', 'Tokyo'],
    'Salary': [50000, 75000, 60000, 80000, 55000],
    'Experience': [2, 3, 4, 5, 6],
    'Bonus': [1000, 2000, 3000, 4000, 5000],
    'Department': ['HR', 'Engineering', 'Marketing', 'Sales', 'Finance']
}

# Create a DataFrame
df_temp = pd.DataFrame(data)

# Save the DataFrame to a CSV file
df_temp.to_csv('employee_data.csv', index=False)

# Read the CSV file back into a DataFrame
df_temp = pd.read_csv('employee_data.csv')

# Perform operations on the DataFrame 

# Calculate average age
avg_age = df_temp['Age'].mean()

# Filter employees with salary greater than 60000
high_earners = df_temp[df_temp['Salary'] > 60000]

# Group by department and calculate average salary
dept_avg_salary = df_temp.groupby('Department')['Salary'].mean()

# Sort DataFrame by age in descending order
df_sorted = df_temp.sort_values(by='Age', ascending=False)

# Add a new column for bonus (10% of salary)
df_temp['Bonus'] = df_temp['Salary'] * 0.1
# Display some information about the DataFrame
print(df_temp.head())
print("\nDataFrame Info:")
print(df_temp.info())

# Common DataFrame operations for practice:

# Accessing a non-existent column (for error handling practice)
average_experience = df_temp['Experience'].mean()
