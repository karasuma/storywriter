import cv2
import glob

images = glob.glob("./light/*")
for img in images:
    rgb = cv2.imread(img, cv2.IMREAD_COLOR)
    r,g,b = cv2.split(rgb[:,:,:3])
    a = cv2.imread(img, cv2.IMREAD_GRAYSCALE)
    invimg = cv2.merge((255 - r, 255 - g, 255 - b, a))
    cv2.imwrite(img, invimg)