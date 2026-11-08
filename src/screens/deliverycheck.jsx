import { Link } from "react-router-dom";

function Deliverycheck() {
  return (
    <div className="delivery-check-page">
      <div className="delivery-check-container">
        <Link to="/deliverysignin" className="delivery-check-logo">
          MarketGo<span>.</span>
        </Link>

        <div className="delivery-check-content">
          <div className="delivery-check-icon">
            <i className="fa-solid fa-clock"></i>
          </div>

          <p className="delivery-check-label">MARKETGO / КУРЬЕР</p>

          <h1>
            ВАША ЗАЯВКА
            <br />
            НА ПРОВЕРКЕ
          </h1>

          <p className="delivery-check-description">
            Спасибо за регистрацию! Мы получили ваши данные. Администратор
            проверит информацию и подтвердит ваш аккаунт.
          </p>

          <div className="delivery-check-status">
            <span className="delivery-check-status-dot"></span>
            ОЖИДАНИЕ ПОДТВЕРЖДЕНИЯ
          </div>

          <div className="delivery-check-info">
            <i className="fa-solid fa-circle-info"></i>
            <p>
              После подтверждения вы сможете войти в личный кабинет курьера и
              начать принимать заказы.
            </p>
          </div>

          <Link to="/" className="delivery-check-button">
            НА ГЛАВНУЮ <span>→</span>
          </Link>
        </div>

        <div className="delivery-check-footer">MARKETGO © 2026</div>
      </div>
    </div>
  );
}

export default Deliverycheck;
