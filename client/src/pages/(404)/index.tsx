import image_404 from "@/assets/admin/404.png";
const NotFound = () => {
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <img src={image_404} alt="404" className="w-44 h-44 object-cover" />
    </div>
  );
};

export default NotFound;
