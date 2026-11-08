import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";
const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";

function Homeorder() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [takingOrder, setTakingOrder] = useState(false);

  // Получаем заказы
  const getOrders = async () => {
    try {
      const res = await axios.get(ORDERS_URL);

      const waitingOrders = res.data.filter(
        (item) => item.orderstatus === "Ожидание курьера",
      );

      setOrders(waitingOrders);
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

  // Взять заказ
  // Взять заказ
  const takeOrder = async () => {
    try {
      setTakingOrder(true);

      // Получаем UID курьера
      const uid = localStorage.getItem("uid")?.replaceAll('"', "");

      if (!uid) {
        alert("Сначала войдите в аккаунт курьера");
        return;
      }

      const usersRes = await axios.get(USER_URL);

      const courier = usersRes.data.find(
        (item) => String(item.uid) === String(uid) && item.role === "courier",
      );

      if (!courier) {
        alert("Курьер не найден");
        return;
      }

      const orderRes = await axios.get(`${ORDERS_URL}/${selectedOrder.id}`);

      if (orderRes.data.orderstatus !== "Ожидание курьера") {
        alert("Этот заказ уже забрал другой курьер");
        setSelectedOrder(null);
        getOrders();
        return;
      }

      await axios.put(`${ORDERS_URL}/${selectedOrder.id}`, {
        ...orderRes.data,
        orderstatus: "Едет",
        deliveryId: String(courier.id),
      });

      setOrders((prev) => prev.filter((item) => item.id !== selectedOrder.id));

      setSelectedOrder(null);

      alert("Вы успешно взяли заказ!");
    } catch (error) {
      console.log("Ошибка при взятии заказа:", error);
      alert("Не удалось взять заказ");
    } finally {
      setTakingOrder(false);
    }
  };
  const formatDate = (date) => {
    if (!date) return "Дата не указана";

    return new Date(date).toLocaleString("ru-RU");
  };

  return (
    <div className="homeorder-page">
      {/* Шапка */}

      <header className="homeorder-header">
        <Link to="/deliveryprofile" className="homeorder-back">
          <i className="fa-solid fa-arrow-left"></i>
        </Link>

        <h2>
          Market<span>Go</span>
        </h2>

        <div></div>
      </header>

      {/* Контент */}

      <main className="homeorder-content">
        <div className="homeorder-heading">
          <div>
            <h1>Доступные заказы</h1>
            <p>Заказы, которые ожидают курьера</p>
          </div>

          <div className="homeorder-count">{orders.length} заказов</div>
        </div>

        {/* Загрузка */}

        {loading ? (
          <div className="homeorder-empty">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Загрузка заказов...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Нет заказов */

          <div className="homeorder-empty">
            <i className="fa-solid fa-box-open"></i>
            <h3>Пока нет заказов</h3>
            <p>Когда появятся новые заказы, они будут отображаться здесь.</p>
          </div>
        ) : (
          /* Список заказов */

          <div className="homeorder-list">
            {orders.map((item) => (
              <div className="homeorder-card" key={item.id}>
                <div className="homeorder-card-top">
                  <div className="homeorder-product-image">
                    {item.avatar && /^https?:\/\//.test(item.avatar) ? (
                      <img src={item.avatar} alt={item.name} />
                    ) : (
                      <i className="fa-solid fa-box"></i>
                    )}
                  </div>

                  <div className="homeorder-product-info">
                    <span>Заказ №{item.id}</span>
                    <h3>{item.name || "Товар"}</h3>
                    <p>{item.price || 0} сом</p>
                  </div>

                  <div className="homeorder-status">
                    <i className="fa-solid fa-clock"></i>
                    Ожидание курьера
                  </div>
                </div>

                <div className="homeorder-card-info">
                  <div>
                    <span>Количество</span>
                    <strong>{item.quantity || 1} шт.</strong>
                  </div>

                  <div>
                    <span>Покупатель</span>
                    <strong>
                      {item.firstname || ""} {item.lastname || ""}
                    </strong>
                  </div>

                  <div>
                    <span>Дата заказа</span>
                    <strong>{formatDate(item.createdAt)}</strong>
                  </div>
                </div>

                <div className="homeorder-card-bottom">
                  <div className="homeorder-price">
                    Итого:{" "}
                    <strong>
                      {(
                        Number(item.price) * Number(item.quantity || 1)
                      ).toLocaleString("ru-RU")}{" "}
                      сом
                    </strong>
                  </div>

                  <button
                    className="homeorder-details-btn"
                    onClick={() => setSelectedOrder(item)}
                  >
                    Подробнее
                    <i className="fa-solid fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Подробности заказа */}

        {selectedOrder && (
          <div
            className="homeorder-modal-overlay"
            onClick={() => !takingOrder && setSelectedOrder(null)}
          >
            <div
              className="homeorder-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="homeorder-modal-close"
                onClick={() => setSelectedOrder(null)}
                disabled={takingOrder}
              >
                <i className="fa-solid fa-xmark"></i>
              </button>

              <h2>Информация о заказе</h2>

              <p className="homeorder-modal-number">
                Заказ №{selectedOrder.id}
              </p>

              <div className="homeorder-modal-status">
                <i className="fa-solid fa-clock"></i>
                {selectedOrder.orderstatus}
              </div>

              <div className="homeorder-modal-section">
                <h3>Информация о товаре</h3>

                <div className="homeorder-detail-row">
                  <span>Название</span>
                  <strong>{selectedOrder.name || "Не указано"}</strong>
                </div>

                <div className="homeorder-detail-row">
                  <span>Количество</span>
                  <strong>{selectedOrder.quantity || 1} шт.</strong>
                </div>

                <div className="homeorder-detail-row">
                  <span>Размер</span>
                  <strong>{selectedOrder.size || "Не указан"}</strong>
                </div>

                <div className="homeorder-detail-row">
                  <span>Цвет</span>
                  <strong>{selectedOrder.color || "Не указан"}</strong>
                </div>

                <div className="homeorder-detail-row">
                  <span>Цена за товар</span>
                  <strong>{selectedOrder.price || 0} сом</strong>
                </div>

                <div className="homeorder-detail-row">
                  <span>Общая сумма</span>
                  <strong>
                    {(
                      Number(selectedOrder.price) *
                      Number(selectedOrder.quantity || 1)
                    ).toLocaleString("ru-RU")}{" "}
                    сом
                  </strong>
                </div>
              </div>

              <div className="homeorder-modal-section">
                <h3>Информация о покупателе</h3>

                <div className="homeorder-detail-row">
                  <span>Имя</span>
                  <strong>
                    {selectedOrder.firstname || ""}{" "}
                    {selectedOrder.lastname || ""}
                  </strong>
                </div>

                <div className="homeorder-detail-row">
                  <span>Телефон</span>
                  <strong>{selectedOrder.numberphone || "Не указан"}</strong>
                </div>
              </div>

              <div className="homeorder-modal-section">
                <h3>Адрес доставки</h3>

                <div className="homeorder-detail-row">
                  <span>Адрес покупателя</span>
                  <strong>{selectedOrder.adres || "Не указан"}</strong>
                </div>

                <div className="homeorder-detail-row">
                  <span>Адрес магазина</span>
                  <strong>{selectedOrder.adrescompany || "Не указан"}</strong>
                </div>
              </div>

              <div className="homeorder-modal-section">
                <h3>Дата заказа</h3>

                <strong>{formatDate(selectedOrder.createdAt)}</strong>
              </div>

              {/* Кнопки */}

              <div className="homeorder-modal-buttons">
                <button
                  className="homeorder-take-btn"
                  onClick={takeOrder}
                  disabled={takingOrder}
                >
                  <i className="fa-solid fa-truck-fast"></i>
                  {takingOrder ? "Принимаем..." : "Взять заказ"}
                </button>

                <button
                  className="homeorder-modal-done"
                  onClick={() => setSelectedOrder(null)}
                  disabled={takingOrder}
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Homeorder;
