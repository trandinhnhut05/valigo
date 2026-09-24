/*
 * Copyright (c) 2026 VALIGO Platform
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * VALIGO - Shared Reactive State Store (Phiên bản Việt Nam)
 * Quản lý đơn hàng VNĐ, đội ngũ tài xế, mạng lưới tủ khóa ValiLocker, và sổ cái số kiểm toán.
 */

(function(window) {
  'use strict';

  const STORAGE_KEY = 'valigo_state_vn_v2';

  const INITIAL_STATE = {
    currentRole: 'customer',
    selectedOrderId: 'VLG-88492',
    orders: [
      {
        id: 'VLG-88492',
        customerName: 'Nguyễn Minh Tuấn',
        phone: '+84 905 123 456',
        email: 'tuan.nguyen@vietnamtravel.vn',
        pickupLocation: 'InterContinental Danang Sun Peninsula Resort',
        destination: 'Sân bay Quốc tế Đà Nẵng (DAD) - Ga T2 Quốc Tế',
        pickupTime: 'Hôm nay, 10:30',
        deliveryTime: 'Hôm nay, 17:30',
        luggageCount: 2,
        luggageTypes: ['Vali tiêu chuẩn 24" (18.4kg)', 'Vali xách tay 20" (6.8kg)'],
        serviceTier: 'Giao Hỏa Tốc 2 Giờ',
        status: 'in-transit',
        statusLabel: 'Đang Vận Chuyển Cùng Tài Xế',
        sealId: 'VSS-9480112',
        sealStatus: 'Đã Xác Thực Nguyên Vẹn',
        driverId: 'DRV-402',
        driverName: 'Trần Văn Minh',
        driverPhone: '+84 912 345 678',
        vehicle: 'Xe Van Điện Xanh SM (43C-982.11)',
        totalAmount: 265000,
        insuranceIncluded: true,
        lockerOtp: null,
        lockerCompartment: null,
        recipientCode: 'REC-8849',
        itinerary: {
          checkout: '11:00',
          flight: '19:30',
          freedomHours: '6.5 Giờ'
        },
        milestones: [
          { title: 'Xác Nhận Đơn & Phân Công Tài Xế', time: '09:15', status: 'completed', desc: 'Đã phân tài xế Trần Văn Minh (Van Điện Xanh SM 43C-982.11).' },
          { title: 'Lấy Hành Lý & Khóa Tem Niêm Phong', time: '10:48', status: 'completed', desc: 'Kiểm tra 4 điểm an toàn hoàn tất. Khóa tem số #VSS-9480112.' },
          { title: 'Đang Vận Chuyển Về Sân Bay', time: '11:20', status: 'active', desc: 'Đang di chuyển qua đường Võ Nguyên Giáp. Tốc độ GPS: 38 km/h.' },
          { title: 'Chuyển Vào Tủ Khóa / Quầy Sân Bay', time: 'Dự kiến 16:30', status: 'pending', desc: 'Lưu trữ đệm an toàn tại ValiLocker Ga T2 hoặc quầy đại diện.' },
          { title: 'Bàn Giao & Khách Hàng Ký Nhận', time: 'Dự kiến 17:30', status: 'pending', desc: 'Xác thực chữ ký số và kiểm tra tem niêm phong nguyên vẹn.' }
        ]
      },
      {
        id: 'VLG-51027',
        customerName: 'Lê Hoàng Yến',
        phone: '+84 988 776 655',
        email: 'hoangyen.le@gmail.com',
        pickupLocation: 'Novotel Danang Premier Sông Hàn',
        destination: 'Trạm Tủ Khóa ValiLocker - Ga Sân Bay T1',
        pickupTime: 'Hôm nay, 08:30',
        deliveryTime: 'Hôm nay, 12:00',
        luggageCount: 1,
        luggageTypes: ['Vali ký gửi lớn 28" (23.8kg)'],
        serviceTier: 'Giao Tiêu Chuẩn',
        status: 'stored-locker',
        statusLabel: 'Đang Lưu Tại Tủ Khóa Thông Minh',
        sealId: 'VSS-3382901',
        sealStatus: 'Đã Xác Thực Nguyên Vẹn',
        driverId: 'DRV-108',
        driverName: 'Lê Hoàng',
        driverPhone: '+84 934 567 890',
        vehicle: 'Xe Tải Nhẹ Eco (43F-119.22)',
        totalAmount: 145000,
        insuranceIncluded: true,
        lockerOtp: '683912',
        lockerCompartment: '104',
        recipientCode: 'REC-5102',
        itinerary: {
          checkout: '09:00',
          flight: '14:15',
          freedomHours: '4.5 Giờ'
        },
        milestones: [
          { title: 'Đã Xác Nhận Đơn Hàng', time: '08:00', status: 'completed', desc: 'Tài xế Lê Hoàng tiếp nhận yêu cầu.' },
          { title: 'Nhận Hành Lý & Dán Tem Niêm Phong', time: '08:35', status: 'completed', desc: 'Khóa tem niêm phong #VSS-3382901 tại sảnh khách sạn.' },
          { title: 'Chuyển Về Trạm Tủ Khóa Sân Bay', time: '09:10', status: 'completed', desc: 'Vận chuyển an toàn về trạm ValiLocker Sân bay Đà Nẵng.' },
          { title: 'Đã Lưu Vào Ngăn Tủ Khóa #104', time: '10:05', status: 'completed', desc: 'Ngăn tủ #104 đã khóa chốt. Mã nhận OTP 683-912 đã gửi SMS cho khách.' },
          { title: 'Chờ Khách Tự Mở Khóa Nhận Đồ', time: 'Sẵn sàng 24/7', status: 'active', desc: 'Khách hàng có thể quét mã QR hoặc bấm mã OTP 6 số để nhận đồ bất cứ lúc nào.' }
        ]
      }
    ],
    lockers: [
      { id: '101', status: 'available', size: 'Vali Nhỏ (S)', orderId: null },
      { id: '102', status: 'available', size: 'Tiêu Chuẩn (M)', orderId: null },
      { id: '103', status: 'available', size: 'Cỡ Lớn (L)', orderId: null },
      { id: '104', status: 'occupied', size: 'Cỡ Lớn (L)', orderId: 'VLG-51027', otp: '683912', bagDesc: 'Lê Hoàng Yến - Vali 28"' },
      { id: '105', status: 'available', size: 'Vali Nhỏ (S)', orderId: null },
      { id: '106', status: 'available', size: 'Tiêu Chuẩn (M)', orderId: null },
      { id: '107', status: 'available', size: 'Tiêu Chuẩn (M)', orderId: null },
      { id: '108', status: 'reserved', size: 'Cỡ Lớn (L)', orderId: null },
      { id: '109', status: 'available', size: 'Vali Nhỏ (S)', orderId: null },
      { id: '110', status: 'available', size: 'Tiêu Chuẩn (M)', orderId: null },
      { id: '111', status: 'available', size: 'Cỡ Lớn (L)', orderId: null },
      { id: '112', status: 'available', size: 'Tiêu Chuẩn (M)', orderId: null }
    ],
    drivers: [
      { id: 'DRV-402', name: 'Trần Văn Minh', phone: '+84 912 345 678', rating: 4.9, activeJobs: 1, vehicle: 'Van Điện Xanh SM', status: 'Đang Giao' },
      { id: 'DRV-108', name: 'Lê Hoàng', phone: '+84 934 567 890', rating: 4.8, activeJobs: 0, vehicle: 'Xe Tải Nhẹ Eco', status: 'Sẵn Sàng' },
      { id: 'DRV-305', name: 'Nguyễn Anh Tuấn', phone: '+84 977 112 233', rating: 5.0, activeJobs: 0, vehicle: 'Van Giao Nhận Pro', status: 'Sẵn Sàng' }
    ],
    custodyLedger: [
      { timestamp: '08:00:12', orderId: 'VLG-51027', event: 'ORDER_CREATED', actor: 'Cổng Khách Hàng', hash: 'SHA256:4f8a...c129', details: 'Xác nhận đơn tại Novotel Đà Nẵng' },
      { timestamp: '08:35:44', orderId: 'VLG-51027', event: 'SEAL_AFFIXED', actor: 'Tài xế Lê Hoàng', hash: 'SHA256:7b1e...09d1', details: 'Khóa tem niêm phong VSS-3382901 và quét xác thực' },
      { timestamp: '10:05:30', orderId: 'VLG-51027', event: 'LOCKER_DEPOSIT', actor: 'Trạm ValiLocker T1', hash: 'SHA256:88ad...33aa', details: 'Lưu vào ngăn #104; OTP 6 số đã gửi khách hàng' },
      { timestamp: '09:15:00', orderId: 'VLG-88492', event: 'ORDER_CREATED', actor: 'Cổng Khách Hàng', hash: 'SHA256:1a9c...77ef', details: 'Đặt dịch vụ Giao Hỏa Tốc 2 Giờ' },
      { timestamp: '10:48:22', orderId: 'VLG-88492', event: 'INSPECTION_PASSED', actor: 'Tài xế Trần Văn Minh', hash: 'SHA256:44fe...9921', details: 'Chụp ảnh kiểm tra 4 điểm & khóa tem VSS-9480112' },
      { timestamp: '11:20:05', orderId: 'VLG-88492', event: 'TRANSIT_CHECKPOINT', actor: 'Cổng IoT Telemetry', hash: 'SHA256:d12e...66ab', details: 'Tọa độ GPS: Cầu Rồng Đà Nẵng (Tốc độ: 38 km/h, Tem nguyên vẹn)' }
    ]
  };

  class StateManager {
    constructor() {
      this.listeners = [];
      this.state = this.loadState();
    }

    loadState() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          return Object.assign({}, INITIAL_STATE, JSON.parse(saved));
        }
      } catch (e) {
        console.warn('Failed to load state from localStorage:', e);
      }
      return JSON.parse(JSON.stringify(INITIAL_STATE));
    }

    saveState() {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to save state:', e);
      }
      this.notify();
    }

    resetState() {
      this.state = JSON.parse(JSON.stringify(INITIAL_STATE));
      this.saveState();
    }

    subscribe(callback) {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    }

    notify() {
      this.listeners.forEach(cb => cb(this.state));
    }

    getState() {
      return this.state;
    }

    setRole(role) {
      this.state.currentRole = role;
      this.saveState();
    }

    selectOrder(orderId) {
      this.state.selectedOrderId = orderId;
      this.saveState();
    }

    getOrder(orderId) {
      return this.state.orders.find(o => o.id === orderId) || this.state.orders[0];
    }

    addOrder(orderData) {
      const orderId = 'VLG-' + Math.floor(10000 + Math.random() * 90000);
      const sealId = 'VSS-' + Math.floor(1000000 + Math.random() * 9000000);
      const recipientCode = 'REC-' + Math.floor(1000 + Math.random() * 9000);
      
      const newOrder = {
        id: orderId,
        customerName: orderData.customerName || 'Quý Khách Hàng',
        phone: orderData.phone || '+84 901 000 000',
        email: orderData.email || 'guest@valigo.vn',
        pickupLocation: orderData.pickupLocation,
        destination: orderData.destination,
        pickupTime: orderData.pickupTime || 'Hôm nay, 11:00',
        deliveryTime: orderData.deliveryTime || 'Hôm nay, 18:00',
        luggageCount: orderData.luggageCount || 1,
        luggageTypes: orderData.luggageTypes || ['Vali tiêu chuẩn 24" (15kg)'],
        serviceTier: orderData.serviceTier || 'Giao Tiêu Chuẩn',
        status: 'confirmed',
        statusLabel: 'Đã Điều Tài Xế Tiếp Nhận',
        sealId: sealId,
        sealStatus: 'Đã Cấp Mã Tem Niêm Phong',
        driverId: 'DRV-402',
        driverName: 'Trần Văn Minh',
        driverPhone: '+84 912 345 678',
        vehicle: 'Xe Van Điện Xanh SM (43C-982.11)',
        totalAmount: orderData.totalAmount || 180000,
        insuranceIncluded: orderData.insuranceIncluded ?? true,
        lockerOtp: null,
        lockerCompartment: null,
        recipientCode: recipientCode,
        itinerary: orderData.itinerary || { checkout: '11:00', flight: '19:00', freedomHours: '6 Giờ' },
        milestones: [
          { title: 'Xác Nhận Đơn & Phân Công Tài Xế', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: 'active', desc: 'Tài xế Trần Văn Minh đang di chuyển đến điểm đón.' },
          { title: 'Kiểm Tra & Khóa Tem Niêm Phong', time: 'Khung giờ hẹn', status: 'pending', desc: `Tem niêm phong #${sealId} sẽ được khóa tại chỗ.` },
          { title: 'Vận Chuyển Đến Điểm Đích', time: 'Khung giờ hẹn', status: 'pending', desc: 'Giám sát lộ trình GPS và nhiệt độ khoang hàng.' },
          { title: 'Giao Đến Khách Sạn / Tủ Khóa ValiLocker', time: 'Khung giờ hẹn', status: 'pending', desc: 'Giao sẵn phòng khách sạn hoặc ngăn tủ khóa bảo mật.' },
          { title: 'Khách Nhận Đồ & Ký Xác Nhận', time: 'Khung giờ hẹn', status: 'pending', desc: 'Ký nhận số và kiểm tra tem niêm phong hoàn tất.' }
        ]
      };

      this.state.orders.unshift(newOrder);
      this.state.selectedOrderId = orderId;

      this.addCustodyLog(orderId, 'ORDER_CREATED', 'Cổng Khách Hàng', `Khởi tạo đơn giao nhận: ${orderData.pickupLocation} -> ${orderData.destination}`);
      this.saveState();
      return newOrder;
    }

    advanceOrderStatus(orderId, newStatus, meta = {}) {
      const order = this.state.orders.find(o => o.id === orderId);
      if (!order) return;

      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      order.status = newStatus;

      if (newStatus === 'picked-up') {
        order.statusLabel = 'Hành Lý Đã Niêm Phong & Kiểm Định';
        order.sealStatus = 'Đã Xác Thực Nguyên Vẹn';
        order.milestones[0].status = 'completed';
        order.milestones[1].status = 'completed';
        order.milestones[1].time = nowTime;
        order.milestones[2].status = 'active';
        this.addCustodyLog(orderId, 'SEAL_AFFIXED', `Tài xế ${order.driverName}`, `Khóa tem ${order.sealId} trên khóa kéo; chụp ảnh đối chứng.`);
      } else if (newStatus === 'in-transit') {
        order.statusLabel = 'Đang Vận Chuyển Cùng Tài Xế';
        order.milestones[1].status = 'completed';
        order.milestones[2].status = 'active';
        order.milestones[2].time = nowTime;
        this.addCustodyLog(orderId, 'TRANSIT_CHECKPOINT', 'Định vị GPS', 'Cập nhật trạm trung chuyển; tem niêm phong nguyên vẹn.');
      } else if (newStatus === 'stored-locker') {
        order.statusLabel = 'Đang Lưu Tại Tủ Khóa Thông Minh';
        order.milestones[2].status = 'completed';
        order.milestones[3].status = 'completed';
        order.milestones[3].time = nowTime;
        order.milestones[4].status = 'active';
        order.lockerCompartment = meta.compartment || '106';
        order.lockerOtp = meta.otp || '749215';
        this.addCustodyLog(orderId, 'LOCKER_DEPOSIT', `Tài xế ${order.driverName}`, `Đặt vào ngăn tủ #${order.lockerCompartment}. Mã OTP đã gửi cho khách.`);
      } else if (newStatus === 'delivered') {
        order.statusLabel = 'Đã Giao Thành Công & Ký Nhận';
        order.milestones.forEach(m => m.status = 'completed');
        order.milestones[4].time = nowTime;
        this.addCustodyLog(orderId, 'DELIVERED', 'Bàn Giao Khách Hàng', 'Chữ ký số xác nhận hợp lệ. Hoàn tất chuỗi hành trình.');
      }

      this.saveState();
    }

    depositToLocker(orderId, compartmentId) {
      const locker = this.state.lockers.find(l => l.id === compartmentId);
      const order = this.state.orders.find(o => o.id === orderId);
      if (!locker || !order) return null;

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      locker.status = 'occupied';
      locker.orderId = orderId;
      locker.otp = otp;
      locker.bagDesc = `${order.customerName} - ${order.luggageTypes[0] || 'Hành lý'}`;

      this.advanceOrderStatus(orderId, 'stored-locker', { compartment: compartmentId, otp: otp });
      return { compartment: compartmentId, otp: otp };
    }

    retrieveFromLocker(compartmentId, otp) {
      const locker = this.state.lockers.find(l => l.id === compartmentId);
      if (!locker) return { success: false, msg: 'Không tìm thấy ngăn tủ' };
      if (locker.status !== 'occupied') return { success: false, msg: 'Ngăn tủ hiện đang trống' };
      if (locker.otp && locker.otp !== otp) return { success: false, msg: 'Mã OTP 6 số không chính xác' };

      const orderId = locker.orderId;
      locker.status = 'available';
      locker.orderId = null;
      locker.otp = null;
      locker.bagDesc = null;

      if (orderId) {
        this.advanceOrderStatus(orderId, 'delivered');
        this.addCustodyLog(orderId, 'LOCKER_RETRIEVAL', 'Khách Nhận Tại Tủ', `Khách đã mở ngăn #${compartmentId} thành công bằng mã OTP.`);
      }

      this.saveState();
      return { success: true, orderId: orderId, compartment: compartmentId };
    }

    addCustodyLog(orderId, event, actor, details) {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const hash = 'SHA256:' + Math.random().toString(16).substring(2, 6) + '...' + Math.random().toString(16).substring(2, 6);
      this.state.custodyLedger.unshift({
        timestamp: timeStr,
        orderId: orderId,
        event: event,
        actor: actor,
        hash: hash,
        details: details
      });
    }
  }

  window.ValigoState = new StateManager();

})(window);
