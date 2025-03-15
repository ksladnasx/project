
// 用户信息接口
export interface UserInfo {
  id: number,
  username: string,
  email: string,
  organization: string,
  avatarUrl: string
}

// 模板文件接口
export interface TemplateFile {
  id: number;
  templateName: string;
  authorId: number;
  authorName: string;
  category: string;
  updateTime: number;
}

// 文件接口
export interface MyFile {
  id: number;
  templateId:number;    
  aiCaseName: string;
  templateName: string;
  authorId: number;
  authorName: string;
  updateTime: number;
}