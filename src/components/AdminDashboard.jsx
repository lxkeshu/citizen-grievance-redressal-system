import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

function AdminDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    filterComplaints();
  }, [complaints, statusFilter, categoryFilter]);

  useEffect(() => {
    if (selectedComplaint && modalRef.current) {
      modalRef.current.showModal();
    }
  }, [selectedComplaint]);

  const filterComplaints = () => {
    let filtered = [...complaints];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(complaint => 
        complaint.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(complaint => 
        complaint.category?.toLowerCase() === categoryFilter.toLowerCase()
      );
    }
    
    setFilteredComplaints(filtered);
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

  const fetchComplaints = async () => {
    try {
      setIsLoading(true);
      const q = query(collection(db, 'complaints'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const complaintsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setComplaints(complaintsList);
    } catch (error) {
      console.error('Error fetching complaints:', error);
      setError('Failed to fetch complaints: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (complaintId, newStatus) => {
    try {
      const complaintRef = doc(db, 'complaints', complaintId);
      await updateDoc(complaintRef, { status: newStatus });
      setComplaints((prevComplaints) =>
        prevComplaints.map((complaint) =>
          complaint.id === complaintId
            ? { ...complaint, status: newStatus }
            : complaint
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
      setError('Failed to update status: ' + error.message);
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

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'badge-warning';
      case 'in progress':
      case 'inprogress':
      case 'in-progress':
        return 'badge-info';
      case 'resolved':
        return 'badge-success';
      case 'rejected':
        return 'badge-error';
      default:
        return 'badge-ghost';
    }
  };

  const handleCloseModal = () => {
    if (modalRef.current) {
      modalRef.current.close();
    }
    setSelectedComplaint(null);
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
          <h1 className="text-3xl font-bold text-base-content">Admin Dashboard</h1>
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
              <div className="stat-title text-base-content">Resolved Complaints</div>
              <div className="stat-value text-success">
                {complaints.filter((c) => c.status === 'resolved').length}
              </div>
            </div>
          </div>
          <div className="stats shadow bg-base-200">
            <div className="stat">
              <div className="stat-title text-base-content">Rejected Complaints</div>
              <div className="stat-value text-error">
                {complaints.filter((c) => c.status === 'rejected').length}
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <h2 className="card-title text-xl font-bold text-base-content mb-4">Filter Complaints</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="form-control w-full md:w-1/2">
                <label className="label">
                  <span className="label-text text-base-content">Status</span>
                </label>
                <select 
                  className="select select-bordered w-full bg-base-100 text-base-content"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-control w-full md:w-1/2">
                <label className="label">
                  <span className="label-text text-base-content">Category</span>
                </label>
                <select 
                  className="select select-bordered w-full bg-base-100 text-base-content"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="general">General</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="education">Education</option>
                  <option value="security">Security</option>
                  <option value="transportation">Transportation</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl font-bold text-base-content mb-4">All Complaints</h2>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table table-pin-rows">
                <thead>
                  <tr>
                    <th className="text-base-content">Date</th>
                    <th className="text-base-content">User</th>
                    <th className="text-base-content">Subject</th>
                    <th className="text-base-content">Category</th>
                    <th className="text-base-content">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr 
                      key={complaint.id} 
                      className="hover:bg-base-300 cursor-pointer"
                      onClick={() => setSelectedComplaint(complaint)}
                    >
                      <td className="text-base-content">{formatDate(complaint.createdAt)}</td>
                      <td className="text-base-content">{complaint.userEmail}</td>
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
              {filteredComplaints.map((complaint) => (
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
                      From: {complaint.userEmail}
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
              <div>
                <p className="text-sm font-semibold text-base-content/70">User</p>
                <p className="text-base-content">{selectedComplaint.userEmail}</p>
              </div>
              <div className="divider"></div>
              <div className="flex flex-col gap-2">
                <p className="text-sm font-semibold text-base-content/70">Actions</p>
                <div className="flex flex-col gap-2">
                  <button
                    className={`btn btn-sm w-full ${selectedComplaint.status === 'in progress' ? 'btn-info' : 'btn-ghost'}`}
                    onClick={() => {
                      updateStatus(selectedComplaint.id, 'in progress');
                      handleCloseModal();
                    }}
                  >
                    In Progress
                  </button>
                  <button
                    className={`btn btn-sm w-full ${selectedComplaint.status === 'resolved' ? 'btn-success' : 'btn-ghost'}`}
                    onClick={() => {
                      updateStatus(selectedComplaint.id, 'resolved');
                      handleCloseModal();
                    }}
                  >
                    Resolve
                  </button>
                  <button
                    className={`btn btn-sm w-full ${selectedComplaint.status === 'rejected' ? 'btn-error' : 'btn-ghost'}`}
                    onClick={() => {
                      updateStatus(selectedComplaint.id, 'rejected');
                      handleCloseModal();
                    }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <form method="dialog" className="modal-backdrop">
          <button onClick={handleCloseModal}>close</button>
        </form>
      </dialog>
    </div>
  );
}

export default AdminDashboard; 