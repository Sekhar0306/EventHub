import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './EventForm.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const EditEvent = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    capacity: '',
    category: 'Other'
  });
  const [image, setImage] = useState(null);
  const [existingImage, setExistingImage] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  const categories = ['Technology', 'Business', 'Arts', 'Sports', 'Education', 'Food & Drink', 'Music', 'Networking', 'Other'];

  const fetchEvent = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/events/${id}`);
      const event = res.data;
      setFormData({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().slice(0, 16),
        location: event.location,
        capacity: event.capacity.toString(),
        category: event.category || 'Other'
      });
      setExistingImage(event.image || '');
    } catch (err) {
      setError('Failed to load event');
    } finally {
      setFetching(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    // Clear field error when user starts typing
    if (fieldErrors[e.target.name]) {
      setFieldErrors({ ...fieldErrors, [e.target.name]: '' });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }
    
    if (!formData.date) {
      errors.date = 'Date and time are required';
    }
    
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    }
    
    if (!formData.capacity || parseInt(formData.capacity) < 1) {
      errors.capacity = 'Capacity must be at least 1';
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
      setExistingImage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      setError('Please fix the errors in the form');
      return;
    }
    
    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title.trim());
    data.append('description', formData.description.trim());
    data.append('date', formData.date);
    data.append('location', formData.location.trim());
    data.append('capacity', formData.capacity);
    data.append('category', formData.category);
    if (image) {
      data.append('image', image);
    }

    try {
      await axios.put(`${API_URL}/events/${id}`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      navigate('/events');
    } catch (err) {
      if (err.response?.data?.errors) {
        const serverErrors = {};
        err.response.data.errors.forEach(error => {
          serverErrors[error.param] = error.msg;
        });
        setFieldErrors(serverErrors);
        setError('Please fix the validation errors');
      } else {
        setError(err.response?.data?.message || 'Failed to update event');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="loading">Loading event...</div>;
  }

  return (
    <div className="event-form-container">
      <div className="event-form-card">
        <h2>Edit Event</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className={fieldErrors.title ? 'error-input' : ''}
            />
            {fieldErrors.title && (
              <span className="field-error">{fieldErrors.title}</span>
            )}
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="5"
              required
              className={fieldErrors.description ? 'error-input' : ''}
            />
            {fieldErrors.description && (
              <span className="field-error">{fieldErrors.description}</span>
            )}
          </div>
          <div className="form-group">
            <label>Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Date & Time *</label>
              <input
                type="datetime-local"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
                className={fieldErrors.date ? 'error-input' : ''}
              />
              {fieldErrors.date && (
                <span className="field-error">{fieldErrors.date}</span>
              )}
            </div>
            <div className="form-group">
              <label>Capacity *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
                required
                className={fieldErrors.capacity ? 'error-input' : ''}
              />
              {fieldErrors.capacity && (
                <span className="field-error">{fieldErrors.capacity}</span>
              )}
            </div>
          </div>
          <div className="form-group">
            <label>Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className={fieldErrors.location ? 'error-input' : ''}
            />
            {fieldErrors.location && (
              <span className="field-error">{fieldErrors.location}</span>
            )}
          </div>
          <div className="form-group">
            <label>Event Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
            />
            {existingImage && !image && (
              <div className="image-preview">
                <img src={`${API_URL.replace('/api', '')}${existingImage}`} alt="Current" />
                <p>Current image</p>
              </div>
            )}
            {image && (
              <div className="image-preview">
                <img src={URL.createObjectURL(image)} alt="Preview" />
                <p>New image</p>
              </div>
            )}
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn btn-cancel"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-submit" disabled={loading}>
              {loading ? 'Updating...' : 'Update Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;

