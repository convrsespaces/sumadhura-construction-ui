'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  getConstructionEvents, 
  createConstructionEvent, 
  updateConstructionEvent, 
  deleteConstructionEvent,
  fileUpload,
  type ConstructionEvent,
  type CreateConstructionEventData
} from '../services/api';
import { 
  IoCalendarOutline, 
  IoStatsChartOutline, 
  IoVideocamOutline, 
  IoImageOutline,
  IoCreateOutline,
  IoTrashOutline
} from 'react-icons/io5';

import './ConstructionEventsManager.css';

// Icon components
const AddIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);



interface ConstructionEventsManagerProps {
  onEventsChange?: (events: ConstructionEvent[]) => void;
}

const ConstructionEventsManager: React.FC<ConstructionEventsManagerProps> = ({ onEventsChange }) => {
  const [events, setEvents] = useState<ConstructionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ConstructionEvent | null>(null);
  const [formData, setFormData] = useState<CreateConstructionEventData>({
    date: new Date().toISOString().split('T')[0],
    title: '',
    url: '',
    poster: '',
    description: '',
    mediaType: 'video',
    completionPercentageAtEvent: 0,
    expected_date: ''
  });
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await getConstructionEvents();
      if (response.success && response.data) {
        setEvents(response.data);
        onEventsChange?.(response.data);
      } else {
        showNotification('Failed to fetch events', 'error');
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      showNotification('An error occurred while fetching events', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [onEventsChange]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      showNotification('Event title is required', 'error');
      return;
    }
    
    if (!formData.date) {
      showNotification('Event date is required', 'error');
      return;
    }
    
    if (!formData.expected_date) {
      showNotification('Expected completion date is required', 'error');
      return;
    }
    
    if (formData.completionPercentageAtEvent < 0 || formData.completionPercentageAtEvent > 100) {
      showNotification('Completion percentage must be between 0 and 100', 'error');
      return;
    }
    
          try {
        setIsLoading(true);
        let response;
        
        // Prepare the data for API
        const submitData = {
          ...formData,
          date: new Date(formData.date).toISOString(),
          title: formData.title.trim(),
          description: formData.description?.trim() || undefined,
          url: formData.url?.trim() || undefined,
          poster: formData.poster?.trim() || undefined,
          expected_date: formData.expected_date?.trim() || undefined
        };
        
        if (editingEvent) {
          response = await updateConstructionEvent(editingEvent.id, submitData);
          if (response.success) {
            showNotification('Event updated successfully', 'success');
          } else {
            showNotification(response.message || 'Failed to update event', 'error');
          }
        } else {
          response = await createConstructionEvent(submitData);
          if (response.success) {
            showNotification('Event created successfully', 'success');
          } else {
            showNotification(response.message || 'Failed to create event', 'error');
          }
        }
        
        if (response.success) {
          setIsModalOpen(false);
          setEditingEvent(null);
          resetForm();
          await fetchEvents();
        }
      } catch (error) {
        console.error('Error during form submission:', error);
        showNotification('An error occurred while saving the event', 'error');
      } finally {
        setIsLoading(false);
      }
  };

  // Handle edit
  const handleEdit = (event: ConstructionEvent) => {
    setEditingEvent(event);
    setFormData({
      date: event.date.split('T')[0],
      title: event.title,
      url: event.url || '',
      poster: event.poster || '',
      description: event.description || '',
      mediaType: event.mediaType || 'video',
      completionPercentageAtEvent: event.completionPercentageAtEvent,
      expected_date: event.expected_date || ''
    });
    setIsModalOpen(true);
  };

  // Handle delete
  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      setIsLoading(true);
      const response = await deleteConstructionEvent(eventId);
      if (response.success) {
        showNotification('Event deleted successfully', 'success');
        fetchEvents();
      } else {
        showNotification(response.message || 'Failed to delete event', 'error');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      showNotification('An error occurred while deleting the event', 'error');
    } finally {
      setIsLoading(false);
    }
  };


  // Reset form
  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      title: '',
      url: '',
      poster: '',
      description: '',
      mediaType: 'video',
      completionPercentageAtEvent: 0,
      expected_date: ''
    });
    setSelectedFile(null);
    setUploadProgress(0);
    setIsUploading(false);
    // Reset file inputs
    const videoFileInput = document.getElementById('video-file-input') as HTMLInputElement;
    const posterFileInput = document.getElementById('poster-file-input') as HTMLInputElement;
    if (videoFileInput) videoFileInput.value = '';
    if (posterFileInput) posterFileInput.value = '';
  };

  // Open modal for new event
  const openNewEventModal = () => {
    setEditingEvent(null);
    resetForm();
    setIsModalOpen(true);
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEvent(null);
    resetForm();
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check if it's a video file
      if (file.type.startsWith('video/')) {
        setSelectedFile(file);
        setFormData({ ...formData, mediaType: 'video' });
        setNotification(null);
      } else {
        showNotification('Please select a valid video file', 'error');
        e.target.value = '';
      }
    }
  };

  // Handle video upload
  const handleVideoUpload = async () => {
    if (!selectedFile) {
      showNotification('Please select a video file first', 'error');
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const videoUrl = await fileUpload(selectedFile, (progress) => {
        setUploadProgress(progress);
      });

      if (videoUrl) {
        setFormData({ ...formData, url: videoUrl });
        showNotification('Video uploaded successfully!', 'success');
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('video-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        showNotification('Failed to upload video', 'error');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      showNotification('An error occurred while uploading the video', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle image upload
  const handleImageUpload = async (file: File, type: 'poster') => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      const imageUrl = await fileUpload(file, (progress) => {
        setUploadProgress(progress);
      });

      if (imageUrl) {
        if (type === 'poster') {
          setFormData({ ...formData, poster: imageUrl });
        }
        showNotification('Image uploaded successfully!', 'success');
        // Reset file input
        const fileInput = document.getElementById('poster-file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        showNotification('Failed to upload image', 'error');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('An error occurred while uploading the image', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="construction-events-manager">
      {/* Notification */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="container">
        {/* Header */}
        <div className="header">
          <div>
            <h1>Construction Events Manager</h1>
            <p>Manage construction progress events and milestones</p>
          </div>
          <button
            onClick={openNewEventModal}
            className="add-button"
          >
            <AddIcon />
            Add New Event
          </button>

        </div>

        {/* Stats */}
        <div className="stats-grid">
          {/* <div className="stat-card">
            <div className="stat-number total">{events.length}</div>
            <div className="stat-label">Total Events</div>
          </div> */}
          {/* <div className="stat-card">
            <div className="stat-number completed">
              {events.filter(e => e.isCompleted).length}
            </div>
            <div className="stat-label">Completed</div>
          </div>
          <div className="stat-card">
            <div className="stat-number pending">
              {events.filter(e => !e.isCompleted).length}
            </div>
            <div className="stat-label">Pending</div>
          </div>
          <div className="stat-card">
            <div className="stat-number videos">
              {events.filter(e => e.mediaType === 'video').length}
            </div>
            <div className="stat-label">Videos</div>
          </div> */}
        </div>

        {/* Events List */}
        <div className="events-container">
          <div className="events-header">
            <h2>Construction Events -</h2><h2>{events.length}</h2>
            

          </div>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p className="loading-text">Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="empty-state">
              <p>No construction events found. Create your first event!</p>
            </div>
          ) : (
            <div className="events-list">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="event-item"
                >
                  <div className="event-content">
                    <div className="event-main">
                      <div className="event-header">
                        <div className="event-title-section">
                          <h3 className="event-title">
                            {event.title}
                          </h3>
                          <div className="media-type">
                            {event.mediaType === 'video' ? (
                              <IoVideocamOutline size={16} />
                            ) : (
                              <IoImageOutline size={16} />
                            )}
                            <span>{event.mediaType}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="event-details">
                        <div className="event-meta">
                          <div className="meta-item">
                            <IoCalendarOutline size={14} />
                            <span>{new Date(event.date).toLocaleDateString()}</span>
                          </div>
                          <div className="meta-item">
                            <IoStatsChartOutline size={14} />
                            <span>{event.completionPercentageAtEvent}% completion</span>
                          </div>
                          {event.description && (
                            <div className="meta-item description">
                              <span>{event.description}</span>
                            </div>
                          )}
                        </div>
                        
                        {(event.url || event.poster) && (
                          <div className="event-links">
                            {event.url && event.mediaType === 'video' && (
                              <div className="video-preview">
                                <video 
                                  controls 
                                  width="200" 
                                  height="120"
                                  poster={event.poster || undefined}
                                  className="event-video"
                                >
                                  <source src={event.url} type="video/mp4" />
                                  Your browser does not support the video tag.
                                </video>
                                <a href={event.url} target="_blank" rel="noopener noreferrer" className="video-link">
                                  Open Video
                                </a>
                              </div>
                            )}
                            {event.url && event.mediaType === 'video' && (
                              <span>🎥 Video URL: {event.url}</span>
                            )}
                            {event.poster && <span>🖼️ Poster: {event.poster}</span>}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="event-actions">
                      <button
                        onClick={() => handleEdit(event)}
                        className="action-button edit-button"
                        title="Edit event"
                      >
                        <IoCreateOutline size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(event.id)}
                        className="action-button delete-button"
                        title="Delete event"
                      >
                        <IoTrashOutline size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>
                {editingEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Event Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Expected Completion Date
                  </label>
                  <input
                    type="date"
                    value={formData.expected_date}
                    onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Completion Percentage
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.completionPercentageAtEvent}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) ;
                      setFormData({ ...formData, completionPercentageAtEvent: value });
                    }}
                    className="form-input"
                    required
                    placeholder="1-100"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Event Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="form-input"
                  placeholder="e.g., Foundation Work Started"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="form-textarea"
                  rows={3}
                  placeholder="Describe the construction event..."
                />
              </div>
              
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">
                    Media Type
                  </label>
                  <select
                    value={formData.mediaType}
                    onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as 'video'  })}
                    className="form-select"
                  >
                    <option value="video">Video</option>
                   {/* <option value="image">Image</option> */}
                  </select>
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Video Upload
                </label>
                <div className="video-upload-container">
                  <input
                    id="video-file-input"
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    className="file-input"
                    disabled={isUploading}
                  />
                  {selectedFile && (
                    <div className="selected-file">
                      <span>Selected: {selectedFile.name}</span>
                      <button
                        type="button"
                        onClick={handleVideoUpload}
                        disabled={isUploading}
                        className="upload-button"
                      >
                        {isUploading ? `Uploading... ${uploadProgress}%` : 'Upload Video'}
                      </button>
                    </div>
                  )}
                  {isUploading && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                      <span>{uploadProgress}%</span>
                    </div>
                  )}
                  {formData.url && (
                    <div className="uploaded-video">
                      <span>✅ Video uploaded successfully</span>
                      <a href={formData.url} target="_blank" rel="noopener noreferrer" className="video-link">
                        View Video
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Video URL (Manual)
                </label>
                <input
                  type="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="form-input"
                  placeholder="Or enter video URL manually: https://example.com/video.mp4"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Poster/Thumbnail Upload
                </label>
                <div className="image-upload-container">
                  <input
                    id="poster-file-input"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && file.type.startsWith('image/')) {
                        handleImageUpload(file, 'poster');
                      } else if (file) {
                        showNotification('Please select a valid image file', 'error');
                        e.target.value = '';
                      }
                    }}
                    className="file-input"
                    disabled={isUploading}
                  />
                  {formData.poster && (
                    <div className="uploaded-image">
                      <span>✅ Poster uploaded successfully</span>
                      <a href={formData.poster} target="_blank" rel="noopener noreferrer" className="image-link">
                        View Image
                      </a>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">
                  Poster/Thumbnail URL (Manual)
                </label>
                <input
                  type="url"
                  value={formData.poster}
                  onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
                  className="form-input"
                  placeholder="Or enter image URL manually: https://example.com/poster.jpg"
                />
              </div>
              
              <div className="form-actions">

                <button
                  type="button"
                  onClick={closeModal}
                  className="cancel-button"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="submit-button"
                >
                  {isLoading ? 'Saving...' : (editingEvent ? 'Update Event' : 'Create Event')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConstructionEventsManager; 