import { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

// Importing all 10 images
import img1 from '../assets/back/willy1.jpeg';
import img2 from '../assets/back/will2.jpeg';
import img3 from '../assets/back/willy3.jpeg';
import img4 from '../assets/back/willy4.jpeg';
import img5 from '../assets/back/willy5.jpeg';
import img6 from '../assets/back/willy6.jpeg';
import img7 from '../assets/back/willy7.jpeg';
import img8 from '../assets/back/willy8.jpeg';
import img9 from '../assets/back/willy9.jpeg';
import img10 from '../assets/back/willy10.jpeg';

const images = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10];

const BackgroundSlider = () => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % images.length);
        }, 5000); // 5 seconds per image
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="video-background-wrapper slider-background-wrapper">
            <AnimatePresence initial={false}>
                <Motion.div
                    key={index}
                    initial={{ opacity: 0, x: '20%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-20%' }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                    className="global-slider-container"
                >
                    <img
                        src={images[index]}
                        alt={`Background Image ${index + 1}`}
                        className="global-image"
                    />
                </Motion.div>
            </AnimatePresence>
            <div className="global-video-overlay" />
        </div>
    );
};

export default BackgroundSlider;
