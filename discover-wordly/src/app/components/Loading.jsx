import { DotLottieReact } from '@lottiefiles/dotlottie-react'

export default function Loading() {
    return (
        <div className="flex justify-center items-center w-[100vw] h-[100vh] backdrop-blur-sm ">
            <DotLottieReact
                src="https://lottie.host/ce14dae4-b723-4ec2-9295-58b3f8463a58/nJZ9KfugTQ.lottie"
                loop
                autoplay
                className="w-170"
            />
        </div>
    )
}