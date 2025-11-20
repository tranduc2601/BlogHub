import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import TurndownService from 'turndown';
import type { Post } from '@/shared/types';

export const exportToMarkdown = (post: Post) => {
  const author = typeof post.author === 'string' ? post.author : post.author?.name || 'Không rõ';
  const date = new Date(post.createdAt).toLocaleDateString('vi-VN');
  const tags = post.tags || [];
  const content = post.content || post.excerpt || '';
  
  exportToMarkdownRaw(
    post.title,
    author,
    date,
    post.category,
    tags,
    content
  );
};

export const exportToPDF = (post: Post) => {
  const author = typeof post.author === 'string' ? post.author : post.author?.name || 'Không rõ';
  const date = new Date(post.createdAt).toLocaleDateString('vi-VN');
  const tags = post.tags || [];
  const content = post.content || post.excerpt || '';
  
  exportToPDFRaw(
    post.title,
    author,
    date,
    post.category,
    tags,
    content
  );
};

export const exportToMarkdownRaw = (
  title: string,
  author: string,
  date: string,
  category: string,
  tags: string[],
  content: string
) => {
  const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
  });

  const markdownContent = turndownService.turndown(content);

  const markdown = `# ${title}

**Tác giả:** ${author}  
**Ngày đăng:** ${date}  
**Danh mục:** ${category}  
**Tags:** ${tags.map(tag => `#${tag}`).join(', ')}

---

${markdownContent}

---

*Xuất từ BlogHub*
`;
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFilename(title)}.md`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportToPDFRaw = async (
  title: string,
  author: string,
  date: string,
  category: string,
  tags: string[],
  contentHtml: string
) => {
  try {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '800px';
    container.style.padding = '40px';
    container.style.backgroundColor = 'white';
    container.style.fontFamily = 'Arial, sans-serif';
    container.innerHTML = `
      <div style="margin-bottom: 30px; border-bottom: 2px solid #3b82f6; padding-bottom: 20px;">
        <h1 style="font-size: 32px; font-weight: bold; margin-bottom: 15px; color: #1e40af;">
          ${title}
        </h1>
        <div style="font-size: 14px; color: #6b7280; margin-bottom: 10px;">
          <strong>Tác giả:</strong> ${author} | 
          <strong>Ngày đăng:</strong> ${date} | 
          <strong>Danh mục:</strong> ${category}
        </div>
        <div style="font-size: 12px; color: #6b7280;">
          <strong>Tags:</strong> ${tags.map(tag => `#${tag}`).join(', ')}
        </div>
      </div>
      <div style="font-size: 14px; line-height: 1.8; color: #374151;">
        ${contentHtml}
      </div>
      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #9ca3af;">
        Xuất từ BlogHub
      </div>
    `;
    
    document.body.appendChild(container);
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    document.body.removeChild(container);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    const width = pdfWidth;
    const height = width / ratio;
    let heightLeft = height;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, width, height);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - height;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, width, height);
      heightLeft -= pdfHeight;
    }
    pdf.save(`${sanitizeFilename(title)}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Không thể xuất PDF. Vui lòng thử lại!');
  }
};

const sanitizeFilename = (filename: string): string => {
  return filename
    .replace(/[^a-zA-Z0-9\s\-_àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/gi, '')
    .replace(/\s+/g, '-')
    .substring(0, 100);
};
