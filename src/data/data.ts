import { MyFile, TemplateFile } from '../types/types';
export default function testdata() {


  const templateFiles: TemplateFile[] = [
    {
      "id": 205198387, "templateName": "陆军军医大学附属医院病历", "authorName": "张康", "category": "a类", "updateTime": 1724641445000,
      authorId: 23232323
    },
    {
      "id": 205198388, "templateName": "陆军军医大学附属医院病历", "authorName": "张康", "category": "b类", "updateTime": 1728641441261,
      authorId: 23232323
    },
    {
      "id": 205198488, "templateName": "空军军医大学附属医院病历", "authorName": "张康", "category": "b类", "updateTime": 1728641441261,
      authorId: 23232323
    },
    {
      "id": 205198389, "templateName": "陆军军医大学附属医院病历", "authorName": "李明", "category": "a类", "updateTime": 1722641445000,
      authorId: 0
    },
    {
      "id": 205198393, "templateName": "陆军军医大学附属医院病历", "authorName": "周杰", "category": "a类", "updateTime": 1723641441411,
      authorId: 0
    }
    
  ]

  const fileData: MyFile[] = [
    {
      id: 1, // 随机生成的唯一ID
      templateId: 205198431,
      aiCaseName: "案例1",
      templateName: "陆军军医大学附属医院病历",
      authorId: 101,
      authorName: "张康",
      updateTime: 1728641445000,
    },
    {
      id: 2,
      templateId: 205198432,
      aiCaseName: "案例2",
      templateName: "陆军军医大学附属医院病历",
      authorId: 101,
      authorName: "张康",
      updateTime: 1728641445000,
    },
    {
      id: 3,
      templateId: 205198433,
      aiCaseName: "案例3",
      templateName: "陆军军医大学附属医院病历",
      authorId: 101,
      authorName: "张康",
      updateTime: 1728641445000,
    },
    {
      id: 4,
      templateId: 205198434,
      aiCaseName: "案例4",
      templateName: "陆军军医大学附属医院病历",
      authorId: 101,
      authorName: "张康",
      updateTime: 1728641445000,
    },
    {
      id: 5,
      templateId: 205198435,
      aiCaseName: "案例5",
      templateName: "陆军军医大学附属医院病历",
      authorId: 102,
      authorName: "王伟",
      updateTime: 1728641445000,
    },
    {
      id: 6,
      templateId: 205198436,
      aiCaseName: "案例6",
      templateName: "南洋理工大学大学附属医院病历",
      authorId: 102,
      authorName: "王伟",
      updateTime: 1728641445000,
    },
  ];
  // Sort the data by the modify datetime in descending orde
  return { templateFiles, fileData }
}




