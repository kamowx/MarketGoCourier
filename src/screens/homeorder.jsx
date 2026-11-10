import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import DeliveryBottomnav from "../components/DeliveryBottomnav";

const ORDERS_URL = "https://6af02a41b9925b27ce173abb.mockapi.io/orders";
const USER_URL = "https://6aedd445a677fe0fc14f8ae2.mockapi.io/users";

function Homeorder() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [takingOrder, setTakingOrder] = useState(false);

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

  const getWeight = (order) =>
    getProducts(order).reduce(
      (sum, item) =>
        sum + Number(item.weight || 0) * Number(item.quantity || 1),
      0,
    );

  const getOrders = async () => {
    try {
      const res = await axios.get(ORDERS_URL);

      const waitingOrders = res.data.filter((item) => {
        const topStatus = item.orderstatus === "Ожидание курьера";

        const storeStatus =
          Array.isArray(item.storeOrders) &&
          item.storeOrders.some(
            (store) => store.orderstatus === "Ожидание курьера",
          );

        return !item.deliveryId && (topStatus || storeStatus);
      });

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

  const takeOrder = async () => {
    if (!selectedOrder) return;

    try {
      setTakingOrder(true);

      const uid = String(localStorage.getItem("uid") || "").replaceAll('"', "");

      if (!uid) {
        alert("Сначала войдите в аккаунт курьера");
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
        return;
      }

      const orderRes = await axios.get(`${ORDERS_URL}/${selectedOrder.id}`);
      const freshOrder = orderRes.data;

      const waiting =
        freshOrder.orderstatus === "Ожидание курьера" ||
        (Array.isArray(freshOrder.storeOrders) &&
          freshOrder.storeOrders.some(
            (store) => store.orderstatus === "Ожидание курьера",
          ));

      if (!waiting || freshOrder.deliveryId) {
        alert("Этот заказ уже забрал другой курьер");
        setSelectedOrder(null);
        await getOrders();
        return;
      }

      const updatedStores = Array.isArray(freshOrder.storeOrders)
        ? freshOrder.storeOrders.map((store) => ({
            ...store,
            orderstatus: "Едет",
          }))
        : freshOrder.storeOrders;

      const updatedOrder = {
        ...freshOrder,
        orderstatus: "Едет",
        deliveryId: String(courier.id),
        storeOrders: updatedStores,
      };

      await axios.put(`${ORDERS_URL}/${freshOrder.id}`, updatedOrder);

      setOrders((prev) => prev.filter((item) => item.id !== freshOrder.id));
      setSelectedOrder(null);

      alert("Вы успешно взяли заказ!");
      navigate(`/orderstart/${freshOrder.id}`);
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
      <header className="homeorder-header">
        <Link to="/deliveryprofile" className="homeorder-back">
          <i className="fa-solid fa-arrow-left"></i>
        </Link>

        <h2>
          Market<span>Go</span>
        </h2>
        <div></div>
      </header>

      <main className="homeorder-content">
        <div className="homeorder-heading">
          <div>
            <h1>Доступные заказы</h1>
            <p>Заказы, которые ожидают курьера</p>
          </div>

          <div className="homeorder-count">{orders.length} заказов</div>
        </div>

        {loading ? (
          <div className="homeorder-empty">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <p>Загрузка заказов...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="homeorder-empty">
            <i className="fa-solid fa-box-open"></i>
            <h3>Пока нет заказов</h3>
            <p>Когда появятся новые заказы, они будут отображаться здесь.</p>
          </div>
        ) : (
          <div className="homeorder-list">
            {orders.map((item) => {
              const products = getProducts(item);
              const weight = getWeight(item);

              return (
                <div className="homeorder-card" key={item.id}>
                  <div className="homeorder-card-top">
                    <div className="homeorder-product-image">
                      {products[0]?.avatar &&
                      /^https?:\/\//.test(products[0].avatar) ? (
                        <img src={products[0].avatar} alt={products[0].name} />
                      ) : (
                        <i className="fa-solid fa-box"></i>
                      )}
                    </div>

                    <div className="homeorder-product-info">
                      <span>Заказ №{item.id}</span>
                      <h3>{products.length} товара в заказе</h3>
                      <p>Вес: {weight} кг</p>
                    </div>

                    <div className="homeorder-status">
                      <i className="fa-solid fa-clock"></i>
                      Ожидание курьера
                    </div>
                  </div>

                  <div className="homeorder-card-info">
                    <div>
                      <span>Общий вес</span>
                      <strong>{weight} кг</strong>
                    </div>

                    <div>
                      <span>Доставка</span>
                      <strong>
                        {(weight * 100).toLocaleString("ru-RU")} сом
                      </strong>
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
                      Доставка:{" "}
                      <strong>
                        {(weight * 100).toLocaleString("ru-RU")} сом
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
              );
            })}
          </div>
        )}

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
                <h3>Товары в заказе</h3>

                {getProducts(selectedOrder).map((item, index) => (
                  <div className="homeorder-detail-row" key={item.id || index}>
                    <span>
                      {item.name || "Товар"} × {item.quantity || 1}
                    </span>
                    <strong>
                      {Number(item.weight || 0) * Number(item.quantity || 1)} кг
                    </strong>
                  </div>
                ))}

                <div className="homeorder-detail-row">
                  <span>Общий вес</span>
                  <strong>{getWeight(selectedOrder)} кг</strong>
                </div>

                <div className="homeorder-detail-row">
                  <span>Стоимость доставки</span>
                  <strong>
                    {(getWeight(selectedOrder) * 100).toLocaleString("ru-RU")}{" "}
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

      <DeliveryBottomnav />
    </div>
  );
}

export default Homeorder;
