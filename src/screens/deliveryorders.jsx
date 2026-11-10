import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import DeliveryBottomnav from "../components/DeliveryBottomnav";

const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";
const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";

function Deliveryorders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getProducts = (order) => {
    if (Array.isArray(order.products)) return order.products;

    if (order.name) {
      return [
        {
          id: order.productId,
          name: order.name,
          avatar: order.avatar,
          price: order.price,
          size: order.size,
          color: order.color,
          quantity: order.quantity || 1,
          weight: order.weight || 0,
        },
      ];
    }

    return [];
  };

  const getWeight = (order) => {
    return getProducts(order).reduce(
      (sum, item) =>
        sum + Number(item.weight || 0) * Number(item.quantity || 1),
      0,
    );
  };

  const getOrders = async () => {
    try {
      setLoading(true);

      const uid = String(localStorage.getItem("uid") || "").replaceAll('"', "");

      if (!uid) {
        alert("Сначала войдите в аккаунт");
        navigate("/deliverysignin");
        return;
      }

      const usersRes = await axios.get(USER_URL);

      const courier = usersRes.data.find(
        (item) =>
          String(item.uid).replaceAll('"', "") === uid &&
          item.role === "courier",
      );

      if (!courier) {
        alert("Курьер не найден");
        navigate("/deliverysignin");
        return;
      }

      const ordersRes = await axios.get(ORDERS_URL);

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
            {orders.map((item) => {
              const products = getProducts(item);
              const weight = getWeight(item);

              return (
                <div className="deliveryorders-card" key={item.id}>
                  <div className="deliveryorders-product">
                    {products[0]?.avatar ? (
                      <img src={products[0].avatar} alt={products[0].name} />
                    ) : (
                      <div className="deliveryorders-no-image">
                        <i className="fa-solid fa-box"></i>
                      </div>
                    )}

                    <div className="deliveryorders-info">
                      <h3>{products.length} товара в заказе</h3>
                      <p>Заказ №{item.id}</p>
                      <span>Общий вес: {weight} кг</span>
                      <span>
                        Доставка: {(weight * 100).toLocaleString("ru-RU")} сом
                      </span>
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
                      Продолжить
                      <i className="fa-solid fa-truck"></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

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

            <div className="deliveryorders-modal-section">
              <h4>Товары в заказе</h4>

              {getProducts(selectedOrder).map((item, index) => (
                <div
                  className="deliveryorders-detail-row"
                  key={item.id || index}
                >
                  <span>
                    {item.name || "Товар"} × {item.quantity || 1}
                  </span>
                  <strong>
                    {Number(item.weight || 0) * Number(item.quantity || 1)} кг
                  </strong>
                </div>
              ))}

              <div className="deliveryorders-detail-row">
                <span>Общий вес</span>
                <strong>{getWeight(selectedOrder)} кг</strong>
              </div>

              <div className="deliveryorders-detail-row">
                <span>Цена доставки (100 сом/кг)</span>
                <strong>
                  {(getWeight(selectedOrder) * 100).toLocaleString("ru-RU")} сом
                </strong>
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

      <DeliveryBottomnav />
    </div>
  );
}

export default Deliveryorders;
