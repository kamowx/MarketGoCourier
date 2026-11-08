import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Deliveryorders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Получаем заказы курьера
  const getOrders = async () => {
    try {
      setLoading(true);

      // 1. Берём UID из localStorage
      const uid = localStorage.getItem("uid")?.replaceAll('"', "");

      if (!uid) {
        alert("Сначала войдите в аккаунт");
        navigate("/deliverysignin");
        return;
      }

      // 2. Получаем пользователей из MockAPI
      const usersRes = await axios.get(USER_URL);

      // 3. Находим курьера по UID
      const courier = usersRes.data.find(
        (item) => String(item.uid) === String(uid) && item.role === "courier",
      );

      if (!courier) {
        alert("Курьер не найден");
        navigate("/deliverysignin");
        return;
      }

      // 4. Получаем все заказы
      const ordersRes = await axios.get(ORDERS_URL);

      // 5. Оставляем только заказы этого курьера
      const myOrders = ordersRes.data.filter(
        (item) => String(item.deliveryId) === String(courier.id),
      );

      setOrders(myOrders);
    } catch (error) {
      console.log("Ошибка загрузки заказов:", error);
      alert("Не удалось загрузить заказы");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  // Формат даты
  const formatDate = (date) => {
    if (!date) return "Не указана";

    return new Date(date).toLocaleString("ru-RU");
  };

  return (
    <div className="deliveryorders-page">
      <div className="deliveryorders-container">
        <div className="deliveryorders-header">
          <div>
            <h2>Мои заказы</h2>
            <p>Заказы, которые вы взяли на доставку</p>
          </div>

          <Link to="/deliveryprofile" className="deliveryorders-back">
            <i className="fa-solid fa-arrow-left"></i>
            Назад
          </Link>
        </div>

        <div className="deliveryorders-count">
          <i className="fa-solid fa-box"></i>
          Всего заказов: <strong>{orders.length}</strong>
        </div>

        {loading ? (
          <div className="deliveryorders-message">Загрузка заказов...</div>
        ) : orders.length === 0 ? (
          <div className="deliveryorders-empty">
            <i className="fa-solid fa-box-open"></i>
            <h3>Заказов пока нет</h3>
            <p>
              Здесь будут отображаться заказы, которые вы взяли на доставку.
            </p>
          </div>
        ) : (
          <div className="deliveryorders-list">
            {orders.map((item) => (
              <div className="deliveryorders-card" key={item.id}>
                <div className="deliveryorders-product">
                  {item.avatar ? (
                    <img src={item.avatar} alt={item.name} />
                  ) : (
                    <div className="deliveryorders-no-image">
                      <i className="fa-solid fa-box"></i>
                    </div>
                  )}

                  <div className="deliveryorders-info">
                    <h3>{item.name || "Товар"}</h3>
                    <p>Заказ №{item.id}</p>
                    <span>Количество: {item.quantity || 1}</span>
                  </div>
                </div>

                <div className="deliveryorders-card-buttons">
                  <button
                    className="deliveryorders-details-btn"
                    onClick={() => setSelectedOrder(item)}
                  >
                    Подробнее
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>

                  <button
                    className="deliveryorders-start-btn"
                    onClick={() => navigate(`/orderstart/${item.id}`)}
                  >
                    Начать
                    <i className="fa-solid fa-truck"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно с подробностями */}
      {selectedOrder && (
        <div
          className="deliveryorders-modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="deliveryorders-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="deliveryorders-modal-header">
              <div>
                <h3>Информация о заказе</h3>
                <p>Заказ №{selectedOrder.id}</p>
              </div>

              <button
                className="deliveryorders-close"
                onClick={() => setSelectedOrder(null)}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            {selectedOrder.avatar && (
              <img
                className="deliveryorders-modal-image"
                src={selectedOrder.avatar}
                alt={selectedOrder.name}
              />
            )}

            <div className="deliveryorders-modal-section">
              <h4>Информация о товаре</h4>

              <div className="deliveryorders-detail-row">
                <span>Название товара</span>
                <strong>{selectedOrder.name || "Не указано"}</strong>
              </div>

              <div className="deliveryorders-detail-row">
                <span>Количество</span>
                <strong>{selectedOrder.quantity || 1}</strong>
              </div>

              <div className="deliveryorders-detail-row">
                <span>Размер</span>
                <strong>{selectedOrder.size || "Не указан"}</strong>
              </div>

              <div className="deliveryorders-detail-row">
                <span>Цвет</span>
                <strong>{selectedOrder.color || "Не указан"}</strong>
              </div>

              <div className="deliveryorders-detail-row">
                <span>Цена</span>
                <strong>{selectedOrder.price || 0} сом</strong>
              </div>
            </div>

            <div className="deliveryorders-modal-section">
              <h4>Информация о покупателе</h4>

              <div className="deliveryorders-detail-row">
                <span>Имя</span>
                <strong>
                  {selectedOrder.firstname || ""} {selectedOrder.lastname || ""}
                </strong>
              </div>

              <div className="deliveryorders-detail-row">
                <span>Телефон</span>
                <strong>{selectedOrder.numberphone || "Не указан"}</strong>
              </div>

              <div className="deliveryorders-detail-row">
                <span>Адрес доставки</span>
                <strong>{selectedOrder.adres || "Не указан"}</strong>
              </div>

              <div className="deliveryorders-detail-row">
                <span>Адрес магазина</span>
                <strong>{selectedOrder.adrescompany || "Не указан"}</strong>
              </div>
            </div>

            <div className="deliveryorders-modal-section">
              <h4>Данные заказа</h4>

              <div className="deliveryorders-detail-row">
                <span>Статус</span>
                <strong>{selectedOrder.orderstatus || "Не указан"}</strong>
              </div>

              <div className="deliveryorders-detail-row">
                <span>Дата заказа</span>
                <strong>{formatDate(selectedOrder.createdAt)}</strong>
              </div>
            </div>

            <button
              className="deliveryorders-modal-close-btn"
              onClick={() => setSelectedOrder(null)}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deliveryorders;
