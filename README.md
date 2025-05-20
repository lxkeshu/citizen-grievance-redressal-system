# Citizen Grievance Redressal System

A web-based platform that enables citizens to submit and track their grievances while allowing administrators to manage and resolve them efficiently.

## Features

### For Citizens
- User registration and authentication
- Submit new grievances with detailed information
- Track status of submitted grievances
- View history of all grievances
- Real-time status updates
- Dark/Light mode support

### For Administrators
- Secure admin dashboard
- View all submitted grievances
- Update grievance status (Pending, In Progress, Resolved, Rejected)
- Filter grievances by status and category
- Detailed view of each grievance
- Responsive design for all devices

## Tech Stack

- **Frontend:**
  - React.js
  - React Router for navigation
  - DaisyUI for UI components
  - Tailwind CSS for styling
  - Firebase Authentication

- **Backend:**
  - Firebase Firestore
  - Firebase Hosting

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account

## Installation

1. Clone the repository:
```bash
git clone https://github.com/lxkeshu/citizen-grievance-redressal-system.git
cd citizen-grievance-redressal-system
```

2. Install dependencies:
```bash
npm install
```

3. Create a Firebase project and enable:
   - Authentication (Email/Password)
   - Firestore Database
   - Hosting

4. Create a `.env` file in the root directory with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-measurement-id
```

5. Start the development server:
```bash
npm run dev
```

## Usage

### For Citizens
1. Register a new account or login
2. Navigate to the dashboard
3. Click "New Complaint" to submit a grievance
4. Fill in the required details
5. Submit and track your grievance

### For Administrators
1. Login with admin credentials
2. Access the admin dashboard
3. View and manage all grievances
4. Update status and provide feedback

## Project Structure

```
src/
├── components/
│   ├── AdminDashboard.jsx
│   ├── Login.jsx
│   ├── Navbar.jsx
│   ├── Register.jsx
│   └── UserDashboard.jsx
├── firebase.js
├── firebase.config.js
└── App.jsx
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- All API keys and sensitive information are stored in environment variables
- Firebase Authentication for secure user management
- Protected routes for admin access
- Input validation and sanitization

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The MIT License is a permissive license that is short and to the point. It lets people do anything they want with your code as long as they provide attribution back to you and don't hold you liable.

### What you can do with this code:
- ✅ Commercial use
- ✅ Modify
- ✅ Distribute
- ✅ Private use

### What you must do:
- ℹ️ Include the original copyright notice
- ℹ️ Include the license text

### What you cannot do:
- ❌ Hold the author liable

For more information, please refer to the [LICENSE](LICENSE) file in the root directory.

## Acknowledgments

- Firebase for backend services
- DaisyUI for UI components
- React Router for navigation
- Tailwind CSS for styling

## Contact

Lokesh Agarwal - [lxkeshu@gmail.com](lxkeshu@gmail.com)

Project Link: [https://github.com/lxkeshu/citizen-grievance-redressal-system](https://github.com/lxkeshu/citizen-grievance-redressal-system)
