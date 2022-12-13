import React from "react";

const HeroCard = ({item}) => {
    return (
        <div className="list-item">
            <div className="list-item__container">
                <div className="pic">
                    <img src={item.thumbnail.path + "/portrait_xlarge.jpg"} alt=''/>
                </div>
                <div className="info">
                    <h3>{item.name}</h3>
                
                    <div>
                        <strong>Name:</strong>{item.name}
                    </div>
                    <div>
                        <strong>Dersiption: </strong>{item.description ? item.description : ' here nothig'}
                    </div>
                
                </div>
            </div>
        </div>
    )
}

export default HeroCard;