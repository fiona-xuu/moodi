const FloatingTitle = () => {
  return (
    <div className="relative flex items-center justify-center text-white header">
      {/* m */}
      <span
        className="inline-block float-letter"
        style={{
          fontSize: '225px',
          fontWeight: 400,
          lineHeight: 'normal',
          width: '214.241px',
          height: '328.057px',
          animation: 'float-m 3s ease-in-out infinite',
          animationDelay: '0s',
          marginRight: '-35px',
        }}
      >
        m
      </span>
      
      {/* o */}
      <span
        className="inline-block float-letter"
        style={{
          fontSize: '225px',
          fontWeight: 400,
          lineHeight: 'normal',
          width: '127.206px',
          height: '328.057px',
          animation: 'float-o1 3s ease-in-out infinite',
          animationDelay: '0.2s',
          marginRight: '-30px',
        }}
      >
        o
      </span>
      
      {/* o */}
      <span
        className="inline-block float-letter"
        style={{
          fontSize: '225px',
          fontWeight: 400,
          lineHeight: 'normal',
          width: '127.206px',
          height: '328.057px',
          animation: 'float-o2 3s ease-in-out infinite',
          animationDelay: '0.4s',
          marginRight: '-30px',
        }}
      >
        o
      </span>
      
      {/* d */}
      <span
        className="inline-block float-letter"
        style={{
          fontSize: '225px',
          fontWeight: 400,
          lineHeight: 'normal',
          width: '152.312px',
          height: '328.057px',
          animation: 'float-d 3s ease-in-out infinite',
          animationDelay: '0.6s',
          marginRight: '-30px',
        }}
      >
        d
      </span>
      
      {/* i */}
      <span
        className="inline-block float-letter"
        style={{
          fontSize: '225px',
          fontWeight: 400,
          lineHeight: 'normal',
          width: '70.298px',
          height: '328.057px',
          animation: 'float-i 3s ease-in-out infinite',
          animationDelay: '0.8s',
        }}
      >
        i
      </span>
      
      <style>{`
        @keyframes float-m {
          0%, 100% {
            transform: rotate(-5.433deg) translateY(0px);
          }
          50% {
            transform: rotate(-5.433deg) translateY(-20px);
          }
        }
        @keyframes float-o1 {
          0%, 100% {
            transform: rotate(-5.011deg) translateY(0px);
          }
          50% {
            transform: rotate(-5.011deg) translateY(-20px);
          }
        }
        @keyframes float-o2 {
          0%, 100% {
            transform: rotate(3.685deg) translateY(0px);
          }
          50% {
            transform: rotate(3.685deg) translateY(-20px);
          }
        }
        @keyframes float-d {
          0%, 100% {
            transform: rotate(13.191deg) translateY(0px);
          }
          50% {
            transform: rotate(13.191deg) translateY(-20px);
          }
        }
        @keyframes float-i {
          0%, 100% {
            transform: rotate(20.929deg) translateY(0px);
          }
          50% {
            transform: rotate(20.929deg) translateY(-20px);
          }
        }
      `}</style>
    </div>
  );
};

export default FloatingTitle;

