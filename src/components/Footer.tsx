import React from 'react';
const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return <footer className="app-footer">© {year} SEK — All rights reserved.</footer>;
};
export default Footer;
