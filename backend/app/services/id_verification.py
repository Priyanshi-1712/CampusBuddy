import pytesseract
from PIL import Image
import io

def verify_poornima_id(file_bytes: bytes):
    try:
        # Load image from bytes
        image = Image.open(io.BytesIO(file_bytes))
        
        # Perform OCR (Extract text)
        text = pytesseract.image_to_string(image).upper()
        
        # Validation Logic based on your provided ID image
        has_poornima = "POORNIMA" in text
        has_piet = "PIET" in text  # Your barcode starts with PIET
        
        if has_poornima and has_piet:
            return True, "Success"
        
        return False, "Could not verify Poornima ID format. Please ensure PIET code is visible."
    except Exception as e:
        return False, f"Server error processing ID: {str(e)}"