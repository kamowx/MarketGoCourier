import { useNavigate } from "react-router-dom";

function Mybalance() {
  const navigate = useNavigate();

  const balance = 25000;

  return (
    <div className="balance-page">
      <div className="balance-container">
        <button className="balance-back" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i>
          Назад
        </button>

        <div className="balance-heading">
          <p>MARKETGO WALLET</p>
          <h1>Мой баланс</h1>
          <span>Управляйте своими средствами</span>
        </div>

        <div className="balance-card">
          <div className="balance-card-top">
            <div className="balance-card-logo">
              MarketGo<span>.</span>
            </div>
            <i className="fa-solid fa-wifi"></i>
          </div>

          <div className="balance-chip">
            <i className="fa-solid fa-sim-card"></i>
          </div>

          <p className="balance-card-number">
            •••• &nbsp; •••• &nbsp; •••• &nbsp; 4829
          </p>

          <div className="balance-card-bottom">
            <div>
              <span>ВЛАДЕЛЕЦ КАРТЫ</span>
              <strong>MARKETGO USER</strong>
            </div>
            <div className="visa-logo">VISA</div>
          </div>
        </div>

        <div className="balance-amount-card">
          <div>
            <p>ДОСТУПНЫЙ БАЛАНС</p>
            <h2>
              {balance.toLocaleString("ru-RU")} <span>сом</span>
            </h2>
          </div>
          <div className="balance-wallet-icon">
            <i className="fa-solid fa-wallet"></i>
          </div>
        </div>

        <button
          className="balance-add-button"
          onClick={() => alert("Пополнение пока недоступно")}
        >
          <i className="fa-solid fa-plus"></i>
          Пополнить баланс
        </button>

        <div className="balance-history">
          <h3>Последние операции</h3>

          <div className="balance-operation">
            <div className="balance-operation-icon">
              <i className="fa-solid fa-plus"></i>
            </div>
            <div>
              <strong>Пополнение баланса</strong>
              <span>05 ноября 2026</span>
            </div>
            <b>+5 000 сом</b>
          </div>

          <div className="balance-operation">
            <div className="balance-operation-icon">
              <i className="fa-solid fa-bag-shopping"></i>
            </div>
            <div>
              <strong>Покупка товара</strong>
              <span>03 ноября 2026</span>
            </div>
            <b className="balance-minus">−2 800 сом</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Mybalance;
