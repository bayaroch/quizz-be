#!/bin/bash

# Navigate to the api-lambda directory
echo "Quizz - Navigating to api-lambda directory..."
cd api-lambda || { echo "Failed to navigate to api-lambda directory. Exiting."; exit 1; }

# Clean tsbuildinfo
echo "Cleaning .tsbuildinfo..."
rm -rf .tsbuildinfo

# Run the NestJS build
echo "Running NestJS build..."
yarn build

# Check if the build was successful
if [ $? -eq 0 ]; then
    echo "NestJS build completed successfully."
else
    echo "NestJS build failed. Exiting."
    exit 1
fi

# Go back to the root directory
echo "Navigating back to the root directory..."
cd .. || { echo "Failed to navigate back to root directory. Exiting."; exit 1; }

# Navigate to the api-lambda directory
echo "Navigating to api-lambda directory..."

# Run the SAM build
echo "Running SAM build..."
sam build

# Check if SAM build was successful
if [ $? -eq 0 ]; then
    echo "SAM build completed successfully."
else
    echo "SAM build failed. Exiting."
    exit 1
fi

# Copy dist directory to .aws-sam/build/ApiLambdaFunction directory
echo "Copying dist directory to .aws-sam/build/ApiLambdaFunction directory..."
cp -r ./api-lambda/dist ./.aws-sam/build/ApiLambdaFunction/

# Check if the copy was successful
if [ $? -eq 0 ]; then
    echo "Dist directory copied successfully."
else
    echo "Failed to copy dist directory. Exiting."
    exit 1
fi

# Run the SAM deploy
echo "Running SAM deploy..."
yes | sam deploy

# Check if SAM deploy was successful
if [ $? -eq 0 ]; then
    echo "SAM deploy completed successfully."
else
    echo "SAM deploy failed. Please check the logs. Exiting."
    exit 1
fi

echo "Quizz - All operations completed successfully."
