function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer simple-footer">
      <div className="footer-content simple-footer-content">
        <span className="footer-contact">Contact Us: contact@cashassurances.dz | +213 555 00 00 00</span>
        <span className="footer-copy">© {year} CASH Assurances. All rights reserved.</span>
      </div>
    </footer>
  );
}

export default Footer;
