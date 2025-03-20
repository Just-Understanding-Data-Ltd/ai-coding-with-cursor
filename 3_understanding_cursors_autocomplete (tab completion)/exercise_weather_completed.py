import pandas as pd # type: ignore
import numpy as np
import matplotlib.pyplot as plt
from datetime import datetime

# Sample weather data
data = {
    'Date': ['2023-01-01', '2023-01-02', '2023-01-03', '2023-01-04', '2023-01-05',
             '2023-01-06', '2023-01-07', '2023-01-08', '2023-01-09', '2023-01-10'],
    'Temperature': [32, 28, 30, 35, 40, 42, 38, 36, 33, 29],
    'Humidity': [80, 75, 82, 70, 65, 68, 72, 78, 85, 79],
    'Precipitation': [0.5, 0.2, 0.8, 0.0, 0.0, 0.1, 0.3, 0.7, 0.9, 0.4],
    'WindSpeed': [10, 15, 8, 12, 20, 17, 9, 11, 14, 16],
    'Location': ['City A', 'City A', 'City A', 'City A', 'City A',
                'City B', 'City B', 'City B', 'City B', 'City B']
}

# Create a DataFrame
df = pd.DataFrame(data)

# Convert Date column to datetime
df['Date'] = pd.to_datetime(df['Date'])

# Save the DataFrame to a CSV file
df.to_csv('weather_data.csv', index=False)

# Read the CSV file back into a DataFrame
df = pd.read_csv('weather_data.csv')
df['Date'] = pd.to_datetime(df['Date'])

# Calculate average temperature
avg_temp = df['Temperature'].mean()
print(f"Average temperature: {avg_temp:.2f}")

# Find days with precipitation greater than 0.5
rainy_days = df[df['Precipitation'] > 0.5]
print("\nRainy days:")
print(rainy_days)

# Group by location and calculate average weather metrics
location_stats = df.groupby('Location').agg({
    'Temperature': 'mean',
    'Humidity': 'mean',
    'Precipitation': 'sum',
    'WindSpeed': 'mean'
})
