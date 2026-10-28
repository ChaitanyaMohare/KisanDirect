// Mock Notifications Data — replace with MongoDB queries later
const notifications = [
  {
    id: 'N001',
    userId: 'F001',
    type: 'price_alert',
    title: 'Price Alert Triggered',
    titleHi: 'मूल्य अलर्ट सक्रिय',
    message: 'Onion price at Lasalgaon has reached ₹3,200/quintal — your target price!',
    messageHi: 'लासलगाव में कांदा का भाव ₹3,200/क्विंटल पर पहुंच गया — आपका लक्ष्य मूल्य!',
    isRead: false,
    createdAt: '2026-09-25T06:00:00.000Z',
    actionUrl: '/farmer/market-prices'
  },
  {
    id: 'N002',
    userId: 'F001',
    type: 'buyer_request',
    title: 'New Buyer Request',
    titleHi: 'नया खरीदार अनुरोध',
    message: 'ABC Foods Pvt. Ltd. has sent you a new request for 30 quintals of Onion at ₹3,150/quintal.',
    messageHi: 'ABC Foods Pvt. Ltd. ने आपको 30 क्विंटल कांदे के लिए ₹3,150/क्विंटल पर अनुरोध भेजा है।',
    isRead: false,
    createdAt: '2026-09-23T10:00:00.000Z',
    actionUrl: '/farmer/requests'
  },
  {
    id: 'N003',
    userId: 'F001',
    type: 'order_update',
    title: 'Order Update',
    titleHi: 'ऑर्डर अपडेट',
    message: 'Order #KD1024 is now In Transit. Expected delivery by tomorrow.',
    messageHi: 'ऑर्डर #KD1024 अब ट्रांजिट में है। कल तक डिलीवरी की उम्मीद है।',
    isRead: true,
    createdAt: '2026-09-23T07:00:00.000Z',
    actionUrl: '/farmer/orders'
  },
  {
    id: 'N004',
    userId: 'F001',
    type: 'payment',
    title: 'Payment Received',
    titleHi: 'भुगतान प्राप्त हुआ',
    message: 'Payment of ₹1,60,000 received for Order #KD1020 from FreshVeg Exports.',
    messageHi: 'FreshVeg Exports से ऑर्डर #KD1020 के लिए ₹1,60,000 का भुगतान प्राप्त हुआ।',
    isRead: true,
    createdAt: '2026-09-11T14:00:00.000Z',
    actionUrl: '/farmer/earnings'
  }
];

module.exports = notifications;
