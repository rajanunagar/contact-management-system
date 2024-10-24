import React from 'react'

function Loading() {

    return (
        <div className='fullscreen-container'>
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    )
}

export default Loading