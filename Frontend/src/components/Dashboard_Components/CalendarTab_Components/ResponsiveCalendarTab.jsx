import React, { useState, useEffect } from 'react';
import DesktopCalendarTab from './DesktopCalendarTab';
import MobileCalendarTab from './MobileCalendarTab';

const ResponsiveCalendarTab = ({currenUser}) => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return isMobile ? <MobileCalendarTab currenUser={currenUser} /> : <DesktopCalendarTab currentUser={currenUser} />;
};

export default ResponsiveCalendarTab; // Ensure this line is present