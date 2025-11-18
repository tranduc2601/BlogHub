export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinDate: string;
  postsCount: number;
  followersCount: number;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  author: User | string;  authorAvatar?: string;  createdAt: string;
  updatedAt?: string;
  readTime: number;
  likes: number;
  comments?: number;
  views?: number;
  category: string;
  tags: string[];
  featuredImage?: string;
  published?: boolean;
  status?: string;
  total_reactions?: number;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  author: User;
  content: string;
  createdAt: string;
  likes: number;
  isLiked?: boolean;
  parentId?: string | null;
  replies?: Comment[];
}
export const mockUsers: User[] = [
  {
    id: "1",
    name: "Nguyễn Văn An",
    email: "nguyenvanan@example.com",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: "Full-stack developer với 5 năm kinh nghiệm. Yêu thích chia sẻ kiến thức về công nghệ.",
    joinDate: "2023-01-15",
    postsCount: 24,
    followersCount: 1250
  },
  {
    id: "2",
    name: "Trần Thị Bình",
    email: "tranthibinh@example.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    bio: "UI/UX Designer và blogger về lifestyle. Luôn tìm kiếm những ý tưởng sáng tạo mới.",
    joinDate: "2023-03-20",
    postsCount: 18,
    followersCount: 890
  },
  {
    id: "3",
    name: "Lê Minh Cường",
    email: "leminhcuong@example.com",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: "Digital marketer và travel blogger. Chia sẻ kinh nghiệm du lịch và marketing online.",
    joinDate: "2023-02-10",
    postsCount: 32,
    followersCount: 2100
  },
  {
    id: "4",
    name: "Phạm Thu Hương",
    email: "phamthuhuong@example.com",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: "Food blogger và chef. Đam mê ẩm thực và chia sẻ công thức nấu ăn ngon.",
    joinDate: "2023-04-05",
    postsCount: 15,
    followersCount: 1560
  },
  {
    id: "5",
    name: "Hoàng Văn Đức",
    email: "hoangvanduc@example.com",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    bio: "Photographer và content creator. Chuyên về nhiếp ảnh phong cảnh và street photography.",
    joinDate: "2023-01-30",
    postsCount: 28,
    followersCount: 3200
  }
];
export const mockPosts: Post[] = [
  {
    id: "1",
    title: "Hướng dẫn học React từ cơ bản đến nâng cao",
    content: `
# Hướng dẫn học React từ cơ bản đến nâng cao

React là một thư viện JavaScript phổ biến để xây dựng giao diện người dùng, đặc biệt là các ứng dụng web. Trong bài viết này, tôi sẽ chia sẻ lộ trình học React từ cơ bản đến nâng cao.

## 1. Kiến thức cơ bản

### Components
Components là các khối xây dựng cơ bản của React. Mỗi component là một phần nhỏ, có thể tái sử dụng của UI.

### JSX
JSX cho phép bạn viết HTML trong JavaScript một cách trực quan.

### Props và State
- **Props**: Dữ liệu được truyền từ component cha xuống component con
- **State**: Dữ liệu nội bộ của component có thể thay đổi

## 2. Kiến thức trung cấp

### Lifecycle Methods
Hiểu về lifecycle của component giúp bạn kiểm soát khi nào component được mount, update, và unmount.

### Hooks
React Hooks cho phép bạn sử dụng state và các tính năng khác của React mà không cần viết class.

## 3. Kiến thức nâng cao

### Context API
Quản lý state toàn cục mà không cần truyền props qua nhiều cấp.

### Performance Optimization
- React.memo
- useMemo
- useCallback

## Kết luận

React là một công cụ mạnh mẽ để xây dựng ứng dụng web hiện đại. Với lộ trình học này, bạn sẽ có thể tự tin xây dựng các ứng dụng React phức tạp.
    `,
    excerpt: "Tìm hiểu lộ trình học React từ cơ bản đến nâng cao, bao gồm components, hooks, và performance optimization.",
    authorId: "1",
    author: mockUsers[0],
    createdAt: "2024-01-15T10:30:00Z",
    updatedAt: "2024-01-15T10:30:00Z",
    readTime: 8,
    likes: 45,
    comments: 12,
    views: 1250,
    category: "Công nghệ",
    tags: ["React", "JavaScript", "Frontend", "Web Development"],
    featuredImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop",
    published: true
  },
  {
    id: "2",
    title: "10 xu hướng thiết kế UI/UX sẽ thống trị năm 2024",
    content: `
# 10 xu hướng thiết kế UI/UX sẽ thống trị năm 2024

Năm 2024 đang mang đến những xu hướng thiết kế UI/UX mới và thú vị. Hãy cùng khám phá những trend sẽ định hình ngành thiết kế trong năm nay.

## 1. Dark Mode Everywhere
Dark mode không còn là một tính năng tùy chọn mà đã trở thành tiêu chuẩn. Người dùng yêu thích dark mode vì nó dễ chịu cho mắt và tiết kiệm pin.

## 2. Neumorphism 2.0
Neumorphism đã phát triển thành phiên bản 2.0 với những cải tiến về độ tương phản và khả năng tiếp cận.

## 3. Micro-interactions
Những tương tác nhỏ nhưng có ý nghĩa sẽ tạo nên trải nghiệm người dùng tuyệt vời.

## 4. 3D Elements
Việc sử dụng các element 3D trong thiết kế 2D đang trở nên phổ biến hơn bao giờ hết.

## 5. Glassmorphism
Hiệu ứng kính mờ tiếp tục được ưa chuộng trong thiết kế hiện đại.

## 6. Minimalist Typography
Typography đơn giản nhưng mạnh mẽ sẽ là xu hướng chủ đạo.

## 7. Bold Colors
Màu sắc tươi sáng và táo bạo sẽ thu hút sự chú ý của người dùng.

## 8. AI-Powered Personalization
Trí tuệ nhân tạo sẽ giúp cá nhân hóa trải nghiệm người dùng.

## 9. Voice User Interface
Giao diện giọng nói sẽ trở nên phổ biến hơn.

## 10. Sustainable Design
Thiết kế bền vững và thân thiện với môi trường.

## Kết luận

Những xu hướng này sẽ định hình ngành thiết kế UI/UX trong năm 2024. Hãy áp dụng chúng một cách sáng tạo để tạo ra những sản phẩm tuyệt vời.
    `,
    excerpt: "Khám phá 10 xu hướng thiết kế UI/UX sẽ thống trị năm 2024, từ dark mode đến AI-powered personalization.",
    authorId: "2",
    author: mockUsers[1],
    createdAt: "2024-01-12T14:20:00Z",
    updatedAt: "2024-01-12T14:20:00Z",
    readTime: 6,
    likes: 38,
    comments: 8,
    views: 980,
    category: "Design",
    tags: ["UI/UX", "Design Trends", "2024", "User Experience"],
    featuredImage: "https://images.unsplash.com/photo-1558655146-d09347e92766?w=800&h=400&fit=crop",
    published: true
  },
  {
    id: "3",
    title: "Chiến lược Marketing Digital hiệu quả cho startup",
    content: `
# Chiến lược Marketing Digital hiệu quả cho startup

Marketing digital đóng vai trò quan trọng trong sự thành công của startup. Trong bài viết này, tôi sẽ chia sẻ những chiến lược marketing digital hiệu quả nhất.

## 1. Xây dựng Brand Identity mạnh mẽ

### Logo và Visual Identity
Logo phải đơn giản, dễ nhớ và phản ánh đúng giá trị của thương hiệu.

### Brand Voice
Xác định giọng điệu thương hiệu phù hợp với đối tượng mục tiêu.

## 2. Content Marketing

### Blog Content
Tạo nội dung chất lượng cao, có giá trị cho khách hàng.

### Video Marketing
Video là format content có engagement cao nhất hiện tại.

## 3. Social Media Marketing

### Platform Selection
Chọn đúng platform phù hợp với đối tượng mục tiêu.

### Content Strategy
Phát triển chiến lược nội dung nhất quán cho từng platform.

## 4. SEO và SEM

### On-page SEO
Tối ưu hóa nội dung và cấu trúc website.

### Paid Advertising
Sử dụng Google Ads và Facebook Ads hiệu quả.

## 5. Email Marketing

### List Building
Xây dựng danh sách email chất lượng.

### Automation
Sử dụng email automation để nuôi dưỡng leads.

## 6. Analytics và Optimization

### KPI Tracking
Theo dõi các chỉ số quan trọng.

### A/B Testing
Thử nghiệm và tối ưu hóa liên tục.

## Kết luận

Marketing digital cho startup cần sự sáng tạo, kiên trì và khả năng thích ứng. Hãy bắt đầu với những chiến lược cơ bản và phát triển dần theo thời gian.
    `,
    excerpt: "Tìm hiểu những chiến lược marketing digital hiệu quả nhất cho startup, từ brand building đến analytics.",
    authorId: "3",
    author: mockUsers[2],
    createdAt: "2024-01-10T09:15:00Z",
    updatedAt: "2024-01-10T09:15:00Z",
    readTime: 10,
    likes: 52,
    comments: 15,
    views: 1680,
    category: "Marketing",
    tags: ["Marketing", "Digital Marketing", "Startup", "Business"],
    featuredImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=400&fit=crop",
    published: true
  },
  {
    id: "4",
    title: "Bí quyết nấu món Phở Bò chuẩn vị Hà Nội",
    content: `
# Bí quyết nấu món Phở Bò chuẩn vị Hà Nội

Phở Bò là món ăn đặc trưng của Việt Nam, đặc biệt là Phở Hà Nội với hương vị thanh tao, nhẹ nhàng. Trong bài viết này, tôi sẽ chia sẻ bí quyết nấu phở bò chuẩn vị.

## Nguyên liệu cần thiết

### Nước dùng
- Xương bò: 1kg
- Thịt bò: 500g
- Hành tây: 2 củ
- Gừng: 1 củ
- Quế, hồi, thảo quả

### Bánh phở
- Bánh phở tươi: 500g
- Hành lá, ngò gai
- Chanh, ớt, tương ớt

## Cách chế biến

### Bước 1: Chuẩn bị nước dùng
1. Rửa sạch xương bò, chần qua nước sôi
2. Nướng hành tây và gừng cho thơm
3. Đun sôi xương với nước, hớt bọt
4. Thêm gia vị và đun nhỏ lửa 3-4 giờ

### Bước 2: Chuẩn bị thịt bò
1. Thái thịt bò mỏng
2. Trần qua nước dùng sôi
3. Để ráo nước

### Bước 3: Trình bày
1. Cho bánh phở vào tô
2. Xếp thịt bò lên trên
3. Rưới nước dùng nóng
4. Thêm hành lá, ngò gai
5. Ăn kèm chanh, ớt

## Bí quyết để có tô phở ngon

### Nước dùng trong và ngọt
- Luôn hớt bọt khi đun
- Đun nhỏ lửa để nước dùng trong
- Thêm một chút đường phèn

### Thịt bò mềm ngon
- Chọn thịt bò tươi
- Thái mỏng để dễ ăn
- Trần đúng thời gian

### Bánh phở đúng chuẩn
- Chọn bánh phở tươi
- Trần qua nước sôi
- Để ráo nước

## Kết luận

Nấu phở bò cần sự tỉ mỉ và kiên nhẫn. Với bí quyết này, bạn sẽ có được tô phở bò chuẩn vị Hà Nội ngay tại nhà.
    `,
    excerpt: "Học cách nấu món Phở Bò chuẩn vị Hà Nội với bí quyết từng bước chi tiết và những mẹo hay.",
    authorId: "4",
    author: mockUsers[3],
    createdAt: "2024-01-08T16:45:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
    readTime: 7,
    likes: 67,
    comments: 23,
    views: 2100,
    category: "Ẩm thực",
    tags: ["Phở", "Ẩm thực Việt", "Nấu ăn", "Hà Nội"],
    featuredImage: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&h=400&fit=crop",
    published: true
  },
  {
    id: "5",
    title: "Top 10 địa điểm chụp ảnh đẹp nhất Sài Gòn",
    content: `
# Top 10 địa điểm chụp ảnh đẹp nhất Sài Gòn

Sài Gòn không chỉ nổi tiếng với ẩm thực mà còn có nhiều địa điểm chụp ảnh tuyệt đẹp. Dưới đây là danh sách 10 địa điểm chụp ảnh đẹp nhất mà tôi đã khám phá.

## 1. Landmark 81

### Vị trí
Phường Bình Thạnh, TP.HCM

### Đặc điểm
- Tòa nhà cao nhất Việt Nam
- View thành phố từ trên cao tuyệt đẹp
- Ánh sáng vàng vào buổi chiều

### Tips chụp ảnh
- Chụp vào golden hour (5-6h chiều)
- Sử dụng telephoto lens
- Chụp từ các tầng cao xung quanh

## 2. Bitexco Financial Tower

### Vị trí
Quận 1, TP.HCM

### Đặc điểm
- Kiến trúc độc đáo hình búp sen
- View sông Sài Gòn
- Skydeck ở tầng 49

### Tips chụp ảnh
- Chụp từ góc chéo
- Sử dụng wide angle lens
- Chụp cả ban ngày và ban đêm

## 3. Nhà thờ Đức Bà

### Vị trí
Quận 1, TP.HCM

### Đặc điểm
- Kiến trúc Gothic cổ điển
- Gạch đỏ đặc trưng
- Quảng trường rộng rãi

### Tips chụp ảnh
- Chụp từ góc thấp để tạo độ cao
- Sử dụng polarizer filter
- Chụp vào sáng sớm để tránh đông người

## 4. Chợ Bến Thành

### Vị trí
Quận 1, TP.HCM

### Đặc điểm
- Kiến trúc thuộc địa
- Cuộc sống sôi động
- Màu sắc rực rỡ

### Tips chụp ảnh
- Chụp street photography
- Sử dụng prime lens
- Chụp vào sáng sớm hoặc tối muộn

## 5. Đường Nguyễn Huệ

### Vị trí
Quận 1, TP.HCM

### Đặc điểm
- Phố đi bộ hiện đại
- Kiến trúc đa dạng
- Ánh sáng LED về đêm

### Tips chụp ảnh
- Chụp long exposure vào ban đêm
- Sử dụng tripod
- Chụp từ các góc khác nhau

## 6. Bưu điện Trung tâm

### Vị trí
Quận 1, TP.HCM

### Đặc điểm
- Kiến trúc Pháp cổ điển
- Nội thất đẹp
- Ánh sáng tự nhiên

### Tips chụp ảnh
- Chụp từ bên trong
- Sử dụng symmetry
- Chụp vào giữa trưa

## 7. Cầu Ánh Sao

### Vị trí
Quận 7, TP.HCM

### Đặc điểm
- Cầu đi bộ hiện đại
- Ánh sáng LED đẹp mắt
- View sông

### Tips chụp ảnh
- Chụp vào ban đêm
- Sử dụng wide angle
- Chụp từ nhiều góc độ

## 8. Chợ Tân Định

### Vị trí
Quận 1, TP.HCM

### Đặc điểm
- Kiến trúc Art Deco
- Màu hồng đặc trưng
- Cuộc sống địa phương

### Tips chụp ảnh
- Chụp architecture
- Sử dụng color contrast
- Chụp vào sáng sớm

## 9. Phố Tây Bùi Viện

### Vị trí
Quận 1, TP.HCM

### Đặc điểm
- Phố đi bộ sôi động
- Kiến trúc đa dạng
- Văn hóa quốc tế

### Tips chụp ảnh
- Chụp street photography
- Sử dụng fast lens
- Chụp vào buổi tối

## 10. Sân bay Tân Sơn Nhất

### Vị trí
Quận Tân Bình, TP.HCM

### Đặc điểm
- Kiến trúc hiện đại
- View máy bay
- Ánh sáng tốt

### Tips chụp ảnh
- Chụp từ xa
- Sử dụng telephoto
- Chụp vào golden hour

## Kết luận

Sài Gòn có rất nhiều địa điểm chụp ảnh đẹp, từ kiến trúc cổ điển đến hiện đại. Hãy khám phá và tạo ra những bức ảnh tuyệt vời của thành phố này.
    `,
    excerpt: "Khám phá 10 địa điểm chụp ảnh đẹp nhất Sài Gòn, từ Landmark 81 đến các góc phố cổ điển.",
    authorId: "5",
    author: mockUsers[4],
    createdAt: "2024-01-05T11:30:00Z",
    updatedAt: "2024-01-05T11:30:00Z",
    readTime: 12,
    likes: 89,
    comments: 31,
    views: 3450,
    category: "Du lịch",
    tags: ["Sài Gòn", "Chụp ảnh", "Du lịch", "Photography"],
    featuredImage: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=400&fit=crop",
    published: true
  },
  {
    id: "6",
    title: "Làm thế nào để học lập trình hiệu quả?",
    content: `
# Làm thế nào để học lập trình hiệu quả?

Học lập trình có thể là một hành trình đầy thử thách, nhưng với phương pháp đúng đắn, bạn sẽ có thể thành công. Trong bài viết này, tôi sẽ chia sẻ những bí quyết học lập trình hiệu quả.

## 1. Xác định mục tiêu rõ ràng

### Tại sao bạn muốn học lập trình?
- Thay đổi nghề nghiệp
- Phát triển kỹ năng hiện tại
- Tạo ra sản phẩm của riêng mình
- Thỏa mãn sở thích cá nhân

### Lập kế hoạch học tập
- Chọn ngôn ngữ lập trình phù hợp
- Đặt mục tiêu ngắn hạn và dài hạn
- Tạo lịch học cố định

## 2. Chọn đúng ngôn ngữ lập trình

### Người mới bắt đầu
- **Python**: Dễ học, cú pháp đơn giản
- **JavaScript**: Phổ biến, nhiều tài liệu
- **Java**: Cấu trúc rõ ràng, OOP tốt

### Theo mục tiêu
- **Web Development**: HTML, CSS, JavaScript
- **Mobile App**: Swift (iOS), Kotlin (Android)
- **Data Science**: Python, R
- **Game Development**: C#, C++

## 3. Thực hành thường xuyên

### Code hàng ngày
- Dành ít nhất 1-2 giờ mỗi ngày
- Thực hành ngay sau khi học lý thuyết
- Không để kiến thức bị "nguội"

### Dự án thực tế
- Bắt đầu với dự án đơn giản
- Tăng dần độ phức tạp
- Hoàn thiện từng dự án

## 4. Tìm kiếm cộng đồng

### Tham gia forum
- Stack Overflow
- Reddit r/programming
- GitHub

### Kết nối với developer khác
- Tham gia meetup
- Tìm mentor
- Tham gia coding bootcamp

## 5. Đọc code của người khác

### GitHub
- Fork repository thú vị
- Đọc code và hiểu logic
- Học best practices

### Open source projects
- Đóng góp cho dự án nhỏ
- Học cách viết code clean
- Hiểu quy trình development

## 6. Sử dụng công cụ phù hợp

### Code Editor
- **VS Code**: Miễn phí, nhiều extension
- **IntelliJ IDEA**: Mạnh mẽ cho Java
- **Sublime Text**: Nhanh, nhẹ

### Version Control
- **Git**: Quản lý code version
- **GitHub**: Host code online
- **GitLab**: Alternative to GitHub

## 7. Không sợ mắc lỗi

### Debugging skills
- Học cách đọc error message
- Sử dụng debugger
- Tìm kiếm giải pháp online

### Growth mindset
- Mắc lỗi là cơ hội học hỏi
- Không so sánh với người khác
- Tập trung vào sự tiến bộ

## 8. Xây dựng portfolio

### GitHub profile
- Repository đẹp và có README
- Commit message rõ ràng
- Contribution graph tích cực

### Personal website
- Showcase dự án
- Blog về quá trình học
- Contact information

## 9. Luôn cập nhật kiến thức

### Theo dõi trends
- Đọc tech blogs
- Xem conference videos
- Tham gia webinars

### Học công nghệ mới
- Framework mới
- Tools mới
- Best practices mới

## 10. Giữ động lực

### Chia sẻ tiến độ
- Post lên social media
- Viết blog
- Tham gia challenges

### Celebrate milestones
- Hoàn thành khóa học
- Hoàn thành dự án
- Nhận được feedback tích cực

## Kết luận

Học lập trình là một hành trình dài, cần sự kiên trì và đam mê. Với những bí quyết trên, bạn sẽ có thể học lập trình hiệu quả và thành công. Hãy nhớ rằng, mỗi developer giỏi đều từng là người mới bắt đầu!
    `,
    excerpt: "Bí quyết học lập trình hiệu quả từ cơ bản đến nâng cao, bao gồm phương pháp, công cụ và mindset đúng đắn.",
    authorId: "1",
    author: mockUsers[0],
    createdAt: "2024-01-03T08:45:00Z",
    updatedAt: "2024-01-03T08:45:00Z",
    readTime: 9,
    likes: 76,
    comments: 19,
    views: 2890,
    category: "Giáo dục",
    tags: ["Lập trình", "Học tập", "Programming", "Tips"],
    featuredImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop",
    published: true
  }
];
export const mockComments: Comment[] = [
  {
    id: "1",
    postId: "1",
    authorId: "2",
    author: mockUsers[1],
    content: "Bài viết rất hay và chi tiết! Tôi đã học được nhiều điều bổ ích về React. Cảm ơn tác giả đã chia sẻ!",
    createdAt: "2024-01-15T15:30:00Z",
    likes: 5
  },
  {
    id: "2",
    postId: "1",
    authorId: "3",
    author: mockUsers[2],
    content: "Lộ trình học React này rất hữu ích cho người mới bắt đầu. Tôi sẽ áp dụng ngay!",
    createdAt: "2024-01-15T16:45:00Z",
    likes: 3
  },
  {
    id: "3",
    postId: "2",
    authorId: "1",
    author: mockUsers[0],
    content: "Những xu hướng thiết kế này thực sự đang thống trị 2024. Tôi đã áp dụng dark mode và glassmorphism vào dự án của mình.",
    createdAt: "2024-01-12T18:20:00Z",
    likes: 8
  },
  {
    id: "4",
    postId: "4",
    authorId: "5",
    author: mockUsers[4],
    content: "Công thức phở bò này quá tuyệt! Tôi đã thử nấu và gia đình rất thích. Cảm ơn bạn đã chia sẻ bí quyết!",
    createdAt: "2024-01-08T20:15:00Z",
    likes: 12
  },
  {
    id: "5",
    postId: "5",
    authorId: "2",
    author: mockUsers[1],
    content: "Danh sách địa điểm chụp ảnh này rất hữu ích! Tôi sẽ ghé thăm từng nơi một để chụp ảnh.",
    createdAt: "2024-01-05T14:30:00Z",
    likes: 7
  }
];
export const getPostById = (id: string): Post | undefined => {
  return mockPosts.find(post => post.id === id);
};

export const getPostsByAuthor = (authorId: string): Post[] => {
  return mockPosts.filter(post => post.authorId === authorId);
};

export const getCommentsByPostId = (postId: string): Comment[] => {
  return mockComments.filter(comment => comment.postId === postId);
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

export const getRecentPosts = (limit: number = 6): Post[] => {
  return mockPosts
    .filter(post => post.published)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
};

export const getPopularPosts = (limit: number = 6): Post[] => {
  return mockPosts
    .filter(post => post.published)
    .sort((a, b) => ((b.views || 0) + b.likes) - ((a.views || 0) + a.likes))
    .slice(0, limit);
};
