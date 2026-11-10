import { NavLink } from "react-router-dom";

function DeliveryBottomnav() {
  return (
    <div className="delivery-bottom-nav">
      <NavLink to="/homeorder" className="delivery-nav-item">
        <i className="fa-solid fa-house"></i>
        <span>Главная</span>
      </NavLink>

      <NavLink to="/deliveryorders" className="delivery-nav-item">
        <i className="fa-solid fa-box"></i>
        <span>Заказы</span>
      </NavLink>

      <NavLink to="/deliverybalance" className="delivery-nav-item">
        <i className="fa-solid fa-wallet"></i>
        <span>Баланс</span>
      </NavLink>

      <NavLink to="/deliveryprofile" className="delivery-nav-item">
        <i className="fa-solid fa-user"></i>
        <span>Профиль</span>
      </NavLink>
    </div>
  );
}

export default DeliveryBottomnav;
