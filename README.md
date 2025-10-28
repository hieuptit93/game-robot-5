# Voice Bridge Game

Một game ReactJS với phong cách pixel art retro, nơi người chơi giúp nhân vật Pika băng qua cầu bằng cách "phát âm" các câu tiếng Anh.

## Tính năng chính

- **Engine vật lý**: Sử dụng Matter.js để mô phỏng các tấm ván cầu rơi xuống khi phát âm sai
- **UI Retro**: Thiết kế pixel art với font Press Start 2P
- **Nhiều level**: 3 level với độ khó tăng dần
- **Hệ thống combo**: Điểm số tăng theo chuỗi phát âm đúng
- **Mô phỏng giọng nói**: Sử dụng phím A/S/D để giả lập kết quả phân tích giọng nói

## Cách chơi

1. **A**: Phát âm tốt → Ván xanh, +100 điểm
2. **S**: Phát âm tạm được → Ván vàng, +50 điểm  
3. **D**: Phát âm sai → Ván đỏ, rơi xuống, 0 điểm

## Cài đặt và chạy

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm start

# Build cho production
npm build
```

## Cấu trúc dự án

```
src/
├── components/
│   ├── GameScene.js      # Scene chính với Matter.js
│   ├── TopHUD.js         # Thanh thông tin trên (Score, Timer, Combo)
│   ├── BottomUIBar.js    # Thanh điều khiển dưới
│   ├── PikaAvatar.js     # Nhân vật Pika
│   └── PlankObject.js    # Các tấm ván cầu
├── context/
│   └── GameContext.js    # Quản lý state game
├── App.js
└── index.js
```

## Công nghệ sử dụng

- **ReactJS**: Framework chính
- **Matter.js**: Engine vật lý 2D
- **Styled Components**: CSS-in-JS styling
- **Framer Motion**: Animation và effects
- **Context API**: Quản lý state toàn cục

## Game Flow

1. **PROMPT**: Hiển thị câu cần phát âm
2. **SPEAKING**: Người chơi nhấn A/S/D để mô phỏng kết quả
3. **RESULT**: Hiển thị kết quả và tạo ván cầu
4. **VICTORY**: Hoàn thành level khi đủ số ván

Game được thiết kế để dễ dàng mở rộng thêm level, cải thiện graphics, và tích hợp API phân tích giọng nói thực tế trong tương lai.