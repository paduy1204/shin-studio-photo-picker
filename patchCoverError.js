const fs = require('fs');

let page = fs.readFileSync('src/app/admin/album/[id]/page.tsx', 'utf8');

const oldFunc = `  const handleSetCoverImage = async (img: any) => {
    const coverUrl = img.thumbnailLink || img.webContentLink || img.url;
    const { error } = await supabase.from('albums').update({ cover_image_url: coverUrl }).eq('id', id);
    if (error) {
      alert("Lỗi khi đặt ảnh bìa: " + error.message);
    } else {
      alert("Đã đặt ảnh " + img.name + " làm ảnh bìa Album thành công!");
    }
  };`;

const newFunc = `  const handleSetCoverImage = async (img: any) => {
    const coverUrl = img.thumbnailLink || img.webContentLink || img.url;
    const { error } = await supabase.from('albums').update({ cover_image_url: coverUrl }).eq('id', id);
    if (error) {
      if (error.message.includes("cover_image_url")) {
        alert("Vui lòng chạy câu SQL sau trong Supabase SQL Editor để bật tính năng ảnh bìa:\\n\\nALTER TABLE public.albums ADD COLUMN cover_image_url TEXT;");
      } else {
        alert("Lỗi khi đặt ảnh bìa: " + error.message);
      }
    } else {
      alert("Đã đặt ảnh " + img.name + " làm ảnh bìa Album thành công!");
    }
  };`;

page = page.replace(oldFunc, newFunc);
fs.writeFileSync('src/app/admin/album/[id]/page.tsx', page);
console.log('Admin page updated with friendly error catch');
