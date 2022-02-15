const Footer = () => {
  return (
    <footer className="App-footer">
      <div className="footer-left">
        <span className="footer-left-text">
          © Industrias de Firmas Electronicas SA, 2021{" "}
        </span>
        <span className="footer-left-text">
          Made with{" "}
          <img className="heart-img" src={"/heart.png"}></img> in
          Panama{" "}
        </span>
      </div>
      <div className="footer-right">
        <span className="footer-right-text">
          INQUIRY BUSINESS SOLUTIONS
        </span>

        <span className="footer-right-text">SUPPORT</span>
      </div>
    </footer>
  );
};

export default Footer;
