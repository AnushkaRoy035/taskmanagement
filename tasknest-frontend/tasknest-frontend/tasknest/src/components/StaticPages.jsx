import React from 'react';

const StaticPages = ({ page }) => {
  return (
    <div className="static-page">
      {page === 'about' && (
        <>
  <div style={{
    backgroundColor: '#f4f0fa',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '800px',
    margin: '30px auto',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Segoe UI, sans-serif',
    lineHeight: '1.6'
  }}>
    <h2 style={{ color: '#5a189a', fontSize: '28px', marginBottom: '15px' }}>About TaskNest</h2>
    <p style={{ fontSize: '16px', color: '#333' }}>
      <strong>TaskNest</strong> is a modern, cloud-based productivity platform built to empower both students and working professionals. Whether you're juggling academic deadlines, managing project tasks, planning your monthly budget, or simply tracking your daily mood, TaskNest offers an all-in-one solution in one clean and intuitive interface.
    </p>
    <p style={{ fontSize: '16px', color: '#333' }}>
      Designed with simplicity and versatility in mind, TaskNest brings together essential tools—like to-do lists, calendar events, budget planners, and emotional well-being trackers—under one digital roof. You no longer need to jump between multiple apps to stay organized. With real-time syncing and a mobile-friendly interface, your productivity is always just a tap away.
    </p>
    <p style={{ fontSize: '16px', color: '#333' }}>
      TaskNest isn't just a productivity tool—it's your digital partner in achieving balance and focus in your academic, professional, and personal life.
    </p>
  </div>
</>

      )}
      {page === 'features' && (
       <>
  <div style={{
    backgroundColor: '#eae2f8',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '800px',
    margin: '30px auto',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Segoe UI, sans-serif',
    lineHeight: '1.6'
  }}>
    <h2 style={{ color: '#3c096c', fontSize: '28px', marginBottom: '20px' }}>Features</h2>
    <ul style={{ listStyleType: 'none', paddingLeft: 0, fontSize: '16px', color: '#333' }}>
      <li style={{ marginBottom: '12px' }}>
        <strong>Unified Workspace:</strong> Access your tasks, schedules, and tracking tools from one place to reduce clutter and save time.
      </li>
      <li style={{ marginBottom: '12px' }}>
         <strong>Real-time Cloud Sync:</strong> Keep your data safe and instantly updated across all your devices, whether you're at home, school, or the office.
      </li>
      <li style={{ marginBottom: '12px' }}>
         <strong>Responsive & Intuitive UI:</strong> Enjoy a sleek interface that adjusts beautifully on mobile and desktop, making navigation effortless.
      </li>
      <li style={{ marginBottom: '12px' }}>
        <strong>Tailored for Versatility:</strong> Built to support academic planners and professional workflows, adapting to your unique lifestyle.
      </li>
    </ul>
  </div>
</>

      )}
      {page === 'contact' && (
        <>
  <div style={{
    backgroundColor: '#f3f0ff',
    padding: '30px',
    borderRadius: '12px',
    maxWidth: '800px',
    margin: '30px auto',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Segoe UI, sans-serif',
    lineHeight: '1.6'
  }}>
    <h2 style={{ color: '#4b0082', fontSize: '28px', marginBottom: '20px' }}>Contact Us</h2>
    <p style={{ fontSize: '16px', color: '#333' }}>
      We'd love to hear from you! Whether it's feedback, support, or a general inquiry, reach out to us through any of the channels below.
    </p>
    <p style={{ fontSize: '16px', color: '#333' }}>
      📧 Email: <a href="mailto:support@tasknest.com" style={{ color: '#6a0dad', textDecoration: 'none' }}>support@tasknest.com</a>
    </p>
    <p style={{ fontSize: '16px', color: '#333' }}>
      📞 Phone: <a href="tel:+919876543210" style={{ color: '#6a0dad', textDecoration: 'none' }}>+91-9876543210</a>
    </p>
    <p style={{ fontSize: '16px', color: '#333' }}>
      📍 Address: Tech Park, Newtown, Kolkata
    </p>
    <p style={{ fontSize: '16px', color: '#333' }}>
      🔗 Connect with us: &nbsp;
      <a href="https://www.facebook.com/tasknest" target="_blank" rel="noopener noreferrer" style={{ color: '#3b5998', textDecoration: 'none' }}>Facebook</a> |&nbsp;
      <a href="https://www.instagram.com/tasknest" target="_blank" rel="noopener noreferrer" style={{ color: '#c13584', textDecoration: 'none' }}>Instagram</a>
    </p>
  </div>
</>

      )}
    </div>
  );
};

export default StaticPages;