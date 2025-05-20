import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

function UserDashboard() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('general');
  const [complaints, setComplaints] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (selectedComplaint && modalRef.current) {
      modalRef.current.showModal();
    }
  }, [selectedComplaint]);

  const handleCloseModal = () => {
    if (modalRef.current) {
      modalRef.current.close();
    }
    setSelectedComplaint(null);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      if (timestamp.seconds) {
        // Handle Firestore Timestamp
        return new Date(timestamp.seconds * 1000).toLocaleDateString();
      } else if (timestamp instanceof Date) {
        // Handle JavaScript Date
        return timestamp.toLocaleDateString();
      } else if (typeof timestamp === 'string') {
        // Handle string date
        return new Date(timestamp).toLocaleDateString();
      }
      return 'Invalid Date';
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'badge-warning';
      case 'in progress':
      case 'inprogress':
        return 'badge-info';
      case 'resolved':
        return 'badge-success';
      case 'rejected':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      setError('');
      const q = query(
        collection(db, 'complaints'),
        where('userEmail', '==', auth.currentUser.email)
      );
      const querySnapshot = await getDocs(q);
      const complaintsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      complaintsList.sort((a, b) => {
        const dateA = a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000) : new Date(a.createdAt);
        const dateB = b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000) : new Date(b.createdAt);
        return dateB - dateA;
      });
      setComplaints(complaintsList);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Failed to fetch complaints: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    try {
      await addDoc(collection(db, 'complaints'), {
        title,
        description,
        category,
        userEmail: auth.currentUser.email,
        status: 'pending',
        createdAt: new Date()
      });
      setTitle('');
      setDescription('');
      setCategory('general');
      await fetchComplaints();
    } catch (error) {
      console.error('Error submitting complaint:', error);
      setError('Failed to submit complaint: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
      setError('Failed to logout: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-base-content">User Dashboard</h1>
          <button
            className="btn btn-outline btn-error"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-title text-base-content">Total Complaints</div>
              <div className="stat-value text-primary">{complaints.length}</div>
            </div>
          </div>
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-title text-base-content">Pending Complaints</div>
              <div className="stat-value text-warning">
                {complaints.filter((c) => c.status === 'pending').length}
              </div>
            </div>
          </div>
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-title text-base-content">In Progress</div>
              <div className="stat-value text-info">
                {complaints.filter((c) => c.status.toLowerCase() === 'in progress').length}
              </div>
            </div>
          </div>
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-title text-base-content">Resolved</div>
              <div className="stat-value text-success">
                {complaints.filter((c) => c.status === 'resolved').length}
              </div>
            </div>
          </div>
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-title text-base-content">Rejected</div>
              <div className="stat-value text-error">
                {complaints.filter((c) => c.status === 'rejected').length}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-xl font-bold text-base-content mb-4">File a New Complaint</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Subject</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter complaint subject"
                  className="input input-bordered w-full bg-base-100 text-base-content"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Category</span>
                </label>
                <select
                  className="select select-bordered w-full bg-base-100 text-base-content"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="general">General</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="security">Security</option>
                  <option value="transportation">Transportation</option>
                </select>
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text text-base-content">Description</span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24 bg-base-100 text-base-content"
                  placeholder="Enter complaint description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
              </button>
            </form>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl font-bold text-base-content mb-4">Your Complaints</h2>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table table-pin-rows">
                <thead>
                  <tr>
                    <th className="text-base-content">Date</th>
                    <th className="text-base-content">Subject</th>
                    <th className="text-base-content">Category</th>
                    <th className="text-base-content">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr 
                      key={complaint.id} 
                      className="hover:bg-base-300 cursor-pointer"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <td className="text-base-content">{formatDate(complaint.createdAt)}</td>
                      <td className="text-base-content">{complaint.title}</td>
                      <td className="text-base-content">{complaint.category || 'General'}</td>
                      <td>
                        <div className={`badge ${getStatusColor(complaint.status)}`}>
                          {complaint.status}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {complaints.map((complaint) => (
                <div 
                  key={complaint.id}
                  className="card bg-base-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedComplaint(complaint)}
                >
                  <div className="card-body p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="card-title text-base-content text-lg">{complaint.title}</h3>
                      <div className={`badge ${getStatusColor(complaint.status)}`}>
                        {complaint.status}
                      </div>
                    </div>
                    <div className="text-sm text-base-content/70 mt-2">
                      {formatDate(complaint.createdAt)}
                    </div>
                    <div className="text-sm text-base-content/70">
                      Category: {complaint.category || 'General'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Complaint Details Modal */}
        <dialog ref={modalRef} className="modal">
          <div className="modal-box relative">
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={handleCloseModal}
            >
              ✕
            </button>
            <h3 className="font-bold text-lg mb-4 pr-8">Complaint Details</h3>
            {selectedComplaint && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-base-content/70">Status</p>
                  <div className={`badge ${getStatusColor(selectedComplaint.status)}`}>
                    {selectedComplaint.status}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content/70">Category</p>
                  <p className="text-base-content">{selectedComplaint.category || 'General'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content/70">Subject</p>
                  <p className="text-base-content">{selectedComplaint.title}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content/70">Description</p>
                  <p className="text-base-content whitespace-pre-wrap">{selectedComplaint.description}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-base-content/70">Date</p>
                  <p className="text-base-content">{formatDate(selectedComplaint.createdAt)}</p>
                </div>
              </div>
            )}
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={handleCloseModal}>close</button>
          </form>
        </dialog>
      </div>
    </div>
  );
}

export default UserDashboard; 