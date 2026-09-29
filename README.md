# Yearly Planner

This project is a Yearly Planner application built using the MERN stack (MongoDB, Express, React, Node.js). It allows users to set annual goals categorized by different life areas, break them down into target quarters and monthly milestones, track progress, and filter goals by year and target quarter.

## Features

- **User Authentication**: Implement user registration and login functionality.
- **Goal Management**: Create, read, update, and delete goals.
- **Milestone Management**: Add milestones to goals and track their progress.
- **Filtering and Sorting**: Filter goals by year and quarter.
- **Progress Tracking**: Update the progress status of goals.
- **User Interface**: Intuitive UI components for managing goals and milestones.

## Project Structure

```
yearly-planner
├── client
│   ├── src
│   │   ├── components
│   │   ├── features
│   │   │   └── goals
│   │   │       ├── GoalForm.jsx
│   │   │       ├── GoalList.jsx
│   │   │       └── goalApi.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server
│   ├── src
│   │   ├── controllers
│   │   │   └── goalController.js
│   │   ├── models
│   │   │   └── Goal.js
│   │   ├── routes
│   │   │   └── goalRoutes.js
│   │   ├── middleware
│   │   └── app.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Setup Instructions

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd yearly-planner
   ```

2. **Set up the server**:
   - Navigate to the `server` directory:
     ```
     cd server
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Create a `.env` file based on `.env.example` and configure your database connection.
   - Start the server:
     ```
     npm start
     ```

3. **Set up the client**:
   - Navigate to the `client` directory:
     ```
     cd ../client
     ```
   - Install dependencies:
     ```
     npm install
     ```
   - Start the client:
     ```
     npm start
     ```

## Usage

- Users can register and log in to access their goals.
- Create new goals by filling out the form with the title, category, target quarter, and milestones.
- View the list of goals, filter them by year and quarter, and track their progress.
- Update or delete goals and milestones as needed.

## Edge Cases

- Ensure proper handling of leap years for milestone due dates.
- Validate input for quarters to ensure values are within the range of 1-4.
- Prevent progress percentage from exceeding 100% or falling below 0%.
- Validate that goal titles are not empty to avoid errors.
- Handle cases where duplicate goals may be created for the same year and category.

## License

This project is licensed under the MIT License.