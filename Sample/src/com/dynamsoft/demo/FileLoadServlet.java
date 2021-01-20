package com.dynamsoft.demo;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.util.List;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.fileupload.FileItem; 
import org.apache.commons.fileupload.FileUploadException; 
import org.apache.commons.fileupload.disk.DiskFileItemFactory; 
import org.apache.commons.fileupload.servlet.ServletFileUpload; 

import com.dynamsoft.OCR.DynamsoftOCRBasic;
import com.dynamsoft.OCR.RefBytes;
import com.dynamsoft.OCR.ResultFormat;

//import org.apache.log4j.Logger;

// @WebServlet(name = "FileLoadServlet", urlPatterns = {"/upload"})
public class FileLoadServlet extends HttpServlet {
    
    //private static Logger logger = Logger.getLogger(FileLoadServlet.class);
    private static final long serialVersionUID = 1302377543285976972L;

	public static byte[] readBytes(InputStream in) {

		ByteArrayOutputStream out = new ByteArrayOutputStream();
		try {
			byte[] buf = new byte[1024];
			int length = 0;
			while ((length = in.read(buf)) != -1) {
				out.write(buf, 0, length);
			}
		} catch (Exception e1) {
			e1.printStackTrace();
		} finally {
			if (in != null) {
				try {
					in.close();
				} catch (IOException e1) {
				}
			}
		}
		return out.toByteArray();
	}
	
    @Override
    protected void service(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        //logger.info("------------ FileLoadServlet ------------");
        
    	String strDllPath = this.getServletContext().getRealPath("/") + "WEB-INF\\lib";
    	String strTessDataPath = this.getServletContext().getRealPath("/") + "WEB-INF\\lib\\tessdata";

    	response.setContentType("text/html;charset=utf-8");
    	request.setCharacterEncoding("utf-8"); 
         
        DiskFileItemFactory factory = new DiskFileItemFactory();
 
        String path = this.getServletContext().getRealPath("/uploadTemp");  
		File savefolder=new File(path);
        if(savefolder.exists()==false){
            savefolder.mkdir();
        }
        factory.setRepository(savefolder); 
        factory.setSizeThreshold(1024*1024) ;  
 
        ServletFileUpload upload = new ServletFileUpload(factory);  

		List<FileItem> list;
		String fileExtention = ".txt";
		try {
			list = (List<FileItem>)upload.parseRequest(request);
            // OCR
            DynamsoftOCRBasic ocr = new DynamsoftOCRBasic();
    		ocr.setOCRDllPath(strDllPath);
    		ocr.setOCRTessDataPath(strTessDataPath);
	        for(FileItem item : list)  
	        {  
	            String name = item.getFieldName();  
	            if(item.isFormField())  
	            {                     
	                String value = item.getString() ;  
	                request.setAttribute(name, value);  
	                switch(name) {
	                case "OutputFormat": 
	                	switch(value) {
		                	case "0": ocr.setOCRResultFormat(ResultFormat.Text); fileExtention=".txt"; break;
		                	case "1": ocr.setOCRResultFormat(ResultFormat.PDFPlainText); fileExtention=".pdf"; break;
		                	case "2": ocr.setOCRResultFormat(ResultFormat.PDFImageOverText); fileExtention=".pdf"; break;
		                	default:  ocr.setOCRResultFormat(ResultFormat.Text); fileExtention=".txt"; break;
	                	}
	                	break;
	                case "InputLanguage":
	                	ocr.setOCRLanguage(value);
	                	break;
	                case "ProductKey":
	                	ocr.setProductKey(value);
	                	break;
	                }
	            }  
	            else  
	            {  
	                String value = item.getName() ;  
	                int start = value.lastIndexOf("\\");  
	                String filename = value.substring(start+1);  
	                String strOCRResultFileName = filename.substring(0, filename.lastIndexOf(".")) + "_result" + fileExtention;
	                request.setAttribute(name, filename);                
	
	                InputStream inputStream = null;    
					OutputStream out = null;
					OutputStream outResult = null;
	                try {
	                	
	                    inputStream = item.getInputStream();
	
	            		RefBytes refaryRetResultDetails = new RefBytes();
	            		
	            		byte[] aryImageBuffer = FileLoadServlet.readBytes(inputStream);
	            		
	            		byte[] result = ocr.ocrImage(aryImageBuffer, refaryRetResultDetails);
	            		
	            		if(result.length > 0) {
							if(fileExtention == ".pdf"){
								response.getWriter().write("|#|" + strOCRResultFileName);
							} else {
								response.reset(); 
							    response.setContentType("text/plain");
							    response.setHeader("Content-disposition", "attachment; filename=\"" + strOCRResultFileName + "\"");

							    // Write file to response.
							    OutputStream output = response.getOutputStream();
							    output.write(result);
							    output.close();
							}
						}
	
	            		byte[] aryRetResultDetails = refaryRetResultDetails.getValue();
	            		if(aryRetResultDetails != null && aryRetResultDetails.length > 0) {
	            			//System.out.println(aryRetResultDetails.length);
	            		}
	                    //logger.info("File load success.");

	            		
		                // write to file
	            		out = new FileOutputStream(new File(path,filename));
						outResult = new FileOutputStream(new File(path, strOCRResultFileName));
						out.write(aryImageBuffer, 0, aryImageBuffer.length);  
						outResult.write(result, 0, result.length);

	                } catch (IOException e) {
	                	
	                } finally {
	                    inputStream.close();
	                	out.close();
	                	outResult.close();
	                }
	                
	            }  
	        }  

		} catch (FileUploadException e1) {
			e1.printStackTrace();
		}  
    	
    }    
}
