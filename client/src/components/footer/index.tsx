import * as React from "react";
import logo from "@/assets/user/Banner logo hoi quan khong nen.png";
const FooterInfo: React.FC = () => {
  const infoSections = [
    {
      title: "HoiQuanTV là gì?",
      content: [
        "Mục tiêu phát triển của trang web trực tiếp bóng đá HoiQuanTV",
        "Xem bóng đá trực tuyến HoiQuanTV có gì nổi bật?",
        "Phát sóng tất cả giải đấu hot nhất trên thế giới",
        "Hệ thống link tructiepbongda ngon nhất",
        "Trang tổng hợp đầy đủ thông tin về bóng đá",
        "Giao diện thông minh gần gũi người dùng",
        "Những giải bóng đá đang được phát sóng trực tiếp trên HoiQuanTV",
        "Trực tiếp bóng đá World Cup 2022",
        "Hướng dẫn cách xem trực tiếp bóng đá tại HoiQuanTV",
      ],
    },
    {
      title: "Mục tiêu phát triển của trang web trực tiếp bóng đá HoiQuanTV",
      contentParagraphs: [
        "mà tất cả các giải đấu bóng đá hàng đầu trong cho đến ngoài nước đều được trực tiếp đầy đủ. Giúp bạn xem được trận đấu mình thích với trải nghiệm cao nhất. Chính vì thế, nếu có nhu cầu xem bất kỳ trận đấu nào, bạn hãy truy cập vào đây để lấy được link xem bóng đá uy tín nhất nhé.",
        "Ngoài tên thường gọi HoiQuanTV, fan hâm mộ còn biết đến chúng tôi với các tên khác như HoiQuan 1, 2, 7, HoiQuan8, Live, Net, Link… vì sự yêu mến của quý bạn có thể gọi chúng tôi bất kì tên nào mà mình dễ nhớ.",
        "Đây là thời buổi của công nghệ số, cho nên đa số mọi người đều chọn cách xem trực tiếp bóng đá trên điện thoại, máy tính,.. hơn là xem trên TV như trước. Để có thể xem được 1 trận bóng đá trực tiếp với chất lượng cao, đầu tiên bạn phải truy cập vào 1 website uy tín. Tuy nhiên hiện tại ở Việt Nam không có quá nhiều website bóng đá làm được điều này. Cho nên, HoiQuanTV ra đời với mục đích giúp mọi người có được một địa chỉ xem bóng đá chất lượng cao.",
        "Đứng sau HoiQuanTV là những chuyên gia bóng đá hàng đầu tại Việt Nam cũng như các kỹ thuật viên IT chuyên nghiệp. Cho nên chúng tôi đã phát triển cực kỳ nhanh, thêm vào đó cơ sở hạ tầng cũng được áp dụng những công nghệ phát trực tiếp bóng đá mới nhất. Chính vì thế trong một thời gian ngắn, HoiQuanTV đã thu hút được một số lượng người dùng cực kỳ lớn.",
        "Mục tiêu phát triển của chúng tôi là “luôn đặt trải nghiệm của người dùng lên hàng đầu”. Nên chỉ cần vào đây, bạn sẽ được lấy đường link xem bóng đá trực tiếp của trận đấu mình thích khá nhanh chóng. Bởi chúng tôi đang có hệ thống link xem trực tiếp bóng đá ở toàn bộ các giải đấu như Champion League, Ngoại Hạng Anh, Serie A, La Liga, Ligue 1, Cúp C2, Bundesliga, Euro, World Cup, Copa America,… Đương nhiên với những đường link được HoiQuanTV cung cấp bạn sẽ xem được trận đấu bóng đá với chất lượng hình ảnh có độ phân giải cao, âm thanh chân thực, đường truyền ổn định, bình luận bằng tiếng Việt hấp dẫn, kích thước màn hình đúng chuẩn..",
        "Ngoài việc phát sóng bóng đá miễn phí với chất lượng cao thì HoiQuanTV còn cung cấp cho bạn rất nhiều những thông tin bổ ích khác. Giúp bạn biết được những sự kiện, tin tức bóng đá mới nhất, kết quả tất cả các trận đấu vừa diễn ra, lịch thi đấu, bảng xếp hạng của những giải đấu hàng đầu, kèo nhà cái với thông tin đầy đủ. Đương nhiên toàn bộ những thông tin này cũng được chúng tôi cập nhật cực kỳ đầy đủ và chuẩn xác.",
      ],
    },
  ];

  return (
    <footer className="bg-slate-800 !text-gray-400 py-8 px-4 md:px-6">
      <div className="w-full mx-auto max-w-[640px] sm:max-w-[768px] md:max-w-[960px] lg:max-w-[1024px] xl:max-w-[1200px] 2xl:max-w-[1440px] 3xl:max-w-[1440px] space-y-6">
        {infoSections.map((section, index) => (
          <div key={index}>
            <h2 className="text-base md:!text-xl font-semibold !text-yellow-400 mb-3">
              {section.title}
            </h2>
            {section.content && (
              <ul className="space-y-1 list-disc list-inside pl-2 text-xs md:!text-sm">
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            )}
            {section.contentParagraphs && (
              <div className="space-y-3 !text-sm leading-relaxed  ">
                {section.contentParagraphs.map((paragraph, pIndex) => (
                  <p className="text-xs md:!text-sm text-white" key={pIndex}>
                    {paragraph}
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="border-t border-slate-700 pt-6 !text-center !text-xs">
          <img
            src={logo}
            className="md:w-60 md:h-20 w-32 mx-auto "
            alt="logo"
          />
        </div>
      </div>
    </footer>
  );
};

export default FooterInfo;
