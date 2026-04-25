import os

# Define directories to create
directories = [
    r'C:\Users\Ameen Khan\Documents\gec-portal\backend\controllers',
    r'C:\Users\Ameen Khan\Documents\gec-portal\backend\routes',
    r'C:\Users\Ameen Khan\Documents\gec-portal\frontend\src\pages\events',
    r'C:\Users\Ameen Khan\Documents\gec-portal\frontend\src\pages\club',
    r'C:\Users\Ameen Khan\Documents\gec-portal\frontend\src\pages\admin'
]

# Create each directory
for directory in directories:
    os.makedirs(directory, exist_ok=True)
    print(f'Created: {directory}')

print('\nAll directories created successfully!')
