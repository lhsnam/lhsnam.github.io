---
title: Bảy quyết định giúp biểu đồ dễ đọc
date: 2026-11-16
tags: visualisation, figures
minutes: 6
summary: Những gì tôi rút ra khi tự học trực quan hóa dữ liệu, gói trong bảy quyết định, mỗi quyết định có một cặp biểu đồ trước và sau.
---

Phần lớn hình vẽ của tôi được đọc bởi những người không trực tiếp chạy phân tích: bác sĩ, cộng tác viên, người phản biện. Họ chỉ dành cho một biểu đồ vài giây. Mấy năm qua tôi đọc kỹ những gì các chuyên gia viết về chủ đề này và nhận ra lời khuyên lặp lại khá nhiều. Bài này là bản cô đọng của riêng tôi: bảy quyết định, mỗi quyết định kèm một cặp trước và sau. Dữ liệu trong hình là dữ liệu minh họa tự tạo.

## 1. Quyết định biểu đồ cần nói điều gì

Trước khi chọn loại biểu đồ, tôi viết ra một câu: người đọc cần mang gì về? Câu đó thường trở thành tiêu đề. Tiêu đề chỉ nêu chủ đề thì để người đọc tự làm phần việc còn lại. Tiêu đề nêu phát hiện thì chỉ cho họ nhìn vào đâu và biến biểu đồ thành bằng chứng cho một nhận định.

{{fig:f1}}

Thời gian bạn bỏ ra để biểu đồ dễ hiểu hơn chính là thời gian bạn tiết kiệm cho mọi người đọc nó.

## 2. Bắt đầu bằng màu xám, chỉ thêm màu cho ý chính

Màu là tín hiệu thu hút chú ý mạnh nhất trên trang, nên cần dùng tiết kiệm. Tôi dựng bản đầu của hình chỉ bằng màu xám, rồi tự hỏi người đọc không được bỏ sót phần tử nào, và chỉ phần tử đó nhận màu nhấn. Mọi thứ còn lại, kể cả trục và đường lưới, giữ ở mức lặng. Thêm hai quy tắc liên quan: dùng cùng một màu cho cùng một biến ở các hình khác nhau, và nếu biểu đồ cần hơn khoảng bảy màu thì nên đổi loại biểu đồ hoặc gộp nhóm.

{{fig:f2}}

## 3. Ghi nhãn trực tiếp, đừng dùng chú giải

Mỗi lần mắt đi từ dữ liệu sang chú giải rồi quay lại đều tốn sự chú ý. Khi có thể, tôi đặt tên ở cuối đường hoặc ngay trên cột, để lời giải thích nằm cạnh dữ liệu. Chú giải chỉ là phương án dự phòng khi nhãn trực tiếp không đủ chỗ.

{{fig:f3}}

## 4. Chú thích phần "tại sao", với hai cấp chữ

Dữ liệu cho biết điều gì đã xảy ra. Chỉ tác giả mới nói được tại sao. Một ghi chú ngắn đúng chỗ, như thời điểm bắt đầu điều trị hay đổi lô thí nghiệm, thường là thứ hữu ích nhất trong hình. Tôi giữ chú thích ở hai cấp khác biệt rõ ràng, ví dụ một dòng ngắn in đậm và một dòng chi tiết màu xám, căn trái và đặt gần phần nó mô tả.

{{fig:f4}}

## 5. Để độ sáng thể hiện thứ tự

Với thang liên tục, mắt đọc thứ tự từ độ sáng trước khi đọc sắc độ. Một màu duy nhất đi từ nhạt đến đậm thể hiện thấp đến cao một cách tự nhiên. Thang cầu vồng trộn các bước tối và sáng không theo thứ tự, nên người đọc phải liên tục nhìn lại bảng màu. Một cách thử nhanh: chuyển hình sang thang xám. Nếu thứ tự biến mất thì thang màu là vấn đề.

{{fig:f5}}

## 6. Thiết kế cho người đọc mù màu ngay từ đầu

Một tỷ lệ đáng kể người đọc không phân biệt được một số cặp màu, và đỏ với xanh lá là lỗi kinh điển. Cách khắc phục rẻ: chọn màu khác nhau cả về độ sáng lẫn sắc (xanh dương và cam là cặp đáng tin cậy), đặt các giá trị quan trọng vào những màu dễ phân biệt nhất, và thêm tín hiệu thứ hai như nhãn trực tiếp, hình dạng hay nét đứt. Bước kiểm tra thang xám ở phần trước cũng là phép thử mù màu sơ bộ, và nên dành một phút dùng công cụ mô phỏng trước khi công bố.

{{fig:f6}}

## 7. Chọn phông chữ biết "đối xử" tốt với con số

Phần lớn biểu đồ ổn với một phông không chân đơn giản. Với bảng và nhãn có số, tôi tìm phông có chữ số đồng độ rộng, để phần thập phân và hàng nghìn thẳng cột. Tôi tránh nét quá mảnh hoặc quá hẹp, giữ chữ đủ lớn để đọc trên điện thoại, và chỉ in đậm cho tiêu đề hoặc vài từ cần nhấn.

{{fig:f7}}

## Danh sách kiểm tra ngắn

1. Tôi có nêu được thông điệp trong một câu, và nó có là tiêu đề không?
2. Mọi thứ có là màu xám, trừ đúng một điều quan trọng không?
3. Nhãn có nằm trên dữ liệu, không nằm trong chú giải?
4. Phần "tại sao" đã được chú thích, tối đa hai cấp chữ?
5. Hình có còn đọc được ở dạng thang xám?
6. Số có được đặt bằng phông có chữ số đồng độ rộng?

## Nguồn tham khảo

Những ý trên là phần tổng hợp của riêng tôi từ các tài liệu đọc đi đọc lại. Các bài tôi quay lại nhiều nhất là loạt bài của Datawrapper về [chọn màu](https://www.datawrapper.de/blog/colors), [người đọc mù màu](https://www.datawrapper.de/blog/colorblindness-part2), [chữ trong biểu đồ](https://www.datawrapper.de/blog/text-in-data-visualizations), [phông chữ](https://www.datawrapper.de/blog/fonts-for-data-visualization), [câu hỏi cần đặt khi làm biểu đồ](https://www.datawrapper.de/blog/better-charts) và [tôn trọng thời gian của người đọc](https://www.datawrapper.de/blog/readers-time), cùng bài [Make grey your best friend](https://visualisingdata.com/2015/01/make-grey-best-friend/) của Andy Kirk. Về sách, tôi giới thiệu *Storytelling with Data* của Cole Nussbaumer Knaflic ([trang tác giả](https://www.storytellingwithdata.com/)). Để lấy ý tưởng, tôi xem [Data Vis Dispatch](https://www.datawrapper.de/blog/category/data-vis-dispatch), [Our World in Data](https://ourworldindata.org/) và [FlowingData](http://flowingdata.com). Về dữ liệu bản đồ, [Natural Earth](https://www.naturalearthdata.com/) miễn phí.
