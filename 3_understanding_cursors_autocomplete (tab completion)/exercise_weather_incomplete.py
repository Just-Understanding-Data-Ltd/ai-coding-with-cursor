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

# Save the DataFrame to a CSV file

# Read the CSV file back into a DataFrame

# Calculate average temperature


# Find days with precipitation greater than 0.5

# Group by location and calculate average weather metrics

# Sort DataFrame by temperature in descending order


# Add a new column for "feels_like" temperature (temperature - wind_speed/5)

# Display DataFrame information

# Additional operations:

# Resample daily data to find weekly averages (will require datetime index)

# Create a simple plot of temperature over time

# Find the day with maximum humidity

# Calculate the correlation between temperature and humidity

# Accessing a non-existent column (for error handling practice)
